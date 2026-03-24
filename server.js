import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 80);
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(DATA_DIR, 'game.sqlite');
const DIST_DIR = path.join(__dirname, 'dist');
const MAX_GAME_STATE_BYTES = Number(process.env.MAX_GAME_STATE_BYTES || 1024 * 1024);
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

const hasColumn = (tableName, columnName) => {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some((row) => row.name === columnName);
};

const ensureSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      coins INTEGER NOT NULL DEFAULT 0,
      game_state TEXT NOT NULL DEFAULT '{}',
      level INTEGER NOT NULL DEFAULT 1,
      total_coins_earned INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );
  `);

  const migrationStatements = [];
  if (!hasColumn('users', 'level')) migrationStatements.push('ALTER TABLE users ADD COLUMN level INTEGER NOT NULL DEFAULT 1');
  if (!hasColumn('users', 'total_coins_earned')) migrationStatements.push('ALTER TABLE users ADD COLUMN total_coins_earned INTEGER NOT NULL DEFAULT 0');
  if (!hasColumn('users', 'created_at')) migrationStatements.push('ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  if (!hasColumn('users', 'last_login_at')) migrationStatements.push('ALTER TABLE users ADD COLUMN last_login_at DATETIME');
  migrationStatements.forEach((statement) => db.exec(statement));

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS save_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      coins INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      total_coins_earned INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins DESC, last_updated DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_last_updated ON users(last_updated DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_save_logs_user_id_created_at ON save_logs(user_id, created_at DESC)');
};

ensureSchema();

const statements = {
  getUser: db.prepare(`
    SELECT
      user_id AS userId,
      username,
      coins,
      level,
      total_coins_earned AS totalCoinsEarned,
      game_state AS gameState,
      created_at AS createdAt,
      last_updated AS lastUpdated,
      last_login_at AS lastLoginAt
    FROM users
    WHERE user_id = ?
  `),
  upsertUser: db.prepare(`
    INSERT INTO users (user_id, username, coins, game_state, level, total_coins_earned, created_at, last_updated, last_login_at)
    VALUES (@userId, @username, @coins, @gameState, @level, @totalCoinsEarned, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      username = excluded.username,
      coins = excluded.coins,
      game_state = excluded.game_state,
      level = excluded.level,
      total_coins_earned = excluded.total_coins_earned,
      last_updated = CURRENT_TIMESTAMP
  `),
  touchUserLogin: db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?'),
  createSession: db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, datetime('now', ?))
  `),
  getSession: db.prepare(`
    SELECT
      token,
      user_id AS userId,
      expires_at AS expiresAt
    FROM sessions
    WHERE token = ?
  `),
  clearExpiredSessions: db.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= CURRENT_TIMESTAMP
  `),
  clearUserSessions: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
  insertSaveLog: db.prepare(`
    INSERT INTO save_logs (user_id, coins, level, total_coins_earned)
    VALUES (@userId, @coins, @level, @totalCoinsEarned)
  `),
  getLeaderboard: db.prepare(`
    SELECT
      user_id AS userId,
      username,
      coins,
      level,
      total_coins_earned AS totalCoinsEarned,
      last_updated AS lastUpdated
    FROM users
    ORDER BY coins DESC, last_updated ASC
    LIMIT ? OFFSET ?
  `),
  getUserRank: db.prepare(`
    SELECT rank FROM (
      SELECT
        user_id,
        ROW_NUMBER() OVER (ORDER BY coins DESC, last_updated ASC) AS rank
      FROM users
    )
    WHERE user_id = ?
  `),
  getActiveUserCount: db.prepare(`
    SELECT COUNT(*) AS count
    FROM users
    WHERE last_updated >= datetime('now', '-7 days')
  `),
  getTotalUserCount: db.prepare('SELECT COUNT(*) AS count FROM users')
};

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const normalizeUsername = (value, fallbackUserId = 'player') => {
  const name = String(value || '').trim();
  const clean = name.slice(0, 24);
  if (clean.length > 0) return clean;
  return `玩家_${fallbackUserId.slice(0, 6)}`;
};

const isValidUserId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{3,64}$/.test(value);

const parseIntInRange = (raw, defaultValue, min, max) => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return defaultValue;
  return Math.min(max, Math.max(min, Math.floor(value)));
};

const parseGameState = (serialized) => {
  try {
    const data = JSON.parse(serialized || '{}');
    if (data && typeof data === 'object') return data;
    return {};
  } catch {
    return {};
  }
};

const deriveStats = (gameState, coinsFromBody) => {
  const fromStateCoins = Number(gameState?.coins);
  const fromStateLevel = Number(gameState?.level);
  const fromStateTotal = Number(gameState?.totalCoinsEarned);
  const coins = Number.isFinite(coinsFromBody) ? Math.max(0, Math.floor(coinsFromBody)) : Number.isFinite(fromStateCoins) ? Math.max(0, Math.floor(fromStateCoins)) : 0;
  const level = Number.isFinite(fromStateLevel) ? Math.max(1, Math.floor(fromStateLevel)) : 1;
  const totalCoinsEarned = Number.isFinite(fromStateTotal) ? Math.max(0, Math.floor(fromStateTotal)) : coins;
  return { coins, level, totalCoinsEarned };
};

const issueSession = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresModifier = `+${SESSION_DAYS} days`;
  statements.createSession.run(token, userId, expiresModifier);
  const session = statements.getSession.get(token);
  return { token, expiresAt: session?.expiresAt };
};

const getSessionUserId = (req) => {
  const token = req.header('X-Session-Token');
  if (!token || typeof token !== 'string') return null;
  const session = statements.getSession.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;
  return session.userId;
};

const toUserResponse = (row) => ({
  userId: row.userId,
  username: row.username,
  coins: row.coins,
  level: row.level,
  totalCoinsEarned: row.totalCoinsEarned,
  gameState: parseGameState(row.gameState),
  createdAt: row.createdAt,
  lastUpdated: row.lastUpdated,
  lastLoginAt: row.lastLoginAt
});

const sendError = (res, statusCode, message) => res.status(statusCode).json({ success: false, message });

const upsertUserWithLog = db.transaction((payload) => {
  statements.upsertUser.run(payload);
  statements.insertSaveLog.run({
    userId: payload.userId,
    coins: payload.coins,
    level: payload.level,
    totalCoinsEarned: payload.totalCoinsEarned
  });
});

app.get('/api/health', (req, res) => {
  const sqliteVersion = db.prepare('SELECT sqlite_version() AS version').get().version;
  const totalUsers = statements.getTotalUserCount.get().count;
  const activeUsers7d = statements.getActiveUserCount.get().count;
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptimeSec: Math.floor(process.uptime()),
      nodeVersion: process.version,
      sqliteVersion,
      totalUsers,
      activeUsers7d,
      dbPath: DB_PATH
    }
  });
});

app.post('/api/auth/guest', (req, res) => {
  try {
    statements.clearExpiredSessions.run();
    const body = req.body || {};
    const rawDeviceId = typeof body.deviceId === 'string' && body.deviceId.trim() ? body.deviceId.trim() : crypto.randomUUID();
    const userHash = crypto.createHash('sha256').update(rawDeviceId).digest('hex').slice(0, 20);
    const userId = `u_${userHash}`;
    const current = statements.getUser.get(userId);
    const username = normalizeUsername(body.username, userId);
    const existingState = current ? parseGameState(current.gameState) : {};
    const stats = deriveStats(existingState);

    upsertUserWithLog({
      userId,
      username: current?.username || username,
      coins: current?.coins ?? stats.coins,
      gameState: JSON.stringify(existingState),
      level: current?.level ?? stats.level,
      totalCoinsEarned: current?.totalCoinsEarned ?? stats.totalCoinsEarned
    });

    statements.clearUserSessions.run(userId);
    const session = issueSession(userId);
    statements.touchUserLogin.run(userId);
    const profile = statements.getUser.get(userId);

    res.json({
      success: true,
      data: {
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        user: toUserResponse(profile)
      }
    });
  } catch (error) {
    console.error('auth_guest_failed', error);
    sendError(res, 500, '登录失败');
  }
});

app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidUserId(userId)) return sendError(res, 400, '非法的 userId');
    const user = statements.getUser.get(userId);
    if (!user) return sendError(res, 404, '用户不存在');
    res.json({ success: true, data: toUserResponse(user) });
  } catch (error) {
    console.error('get_user_failed', error);
    sendError(res, 500, '读取用户失败');
  }
});

app.put('/api/user/:userId/name', (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidUserId(userId)) return sendError(res, 400, '非法的 userId');
    const user = statements.getUser.get(userId);
    if (!user) return sendError(res, 404, '用户不存在');

    const sessionUserId = getSessionUserId(req);
    if (sessionUserId && sessionUserId !== userId) return sendError(res, 403, '无权限修改该用户');

    const username = normalizeUsername(req.body?.username, userId);
    upsertUserWithLog({
      userId,
      username,
      coins: user.coins,
      gameState: user.gameState,
      level: user.level,
      totalCoinsEarned: user.totalCoinsEarned
    });

    const updated = statements.getUser.get(userId);
    res.json({ success: true, data: toUserResponse(updated) });
  } catch (error) {
    console.error('update_name_failed', error);
    sendError(res, 500, '更新昵称失败');
  }
});

app.post('/api/user/save', (req, res) => {
  try {
    const { userId, username, coins, gameState } = req.body || {};
    if (!isValidUserId(userId)) return sendError(res, 400, '缺少或非法的 userId');
    if (gameState && typeof gameState !== 'object') return sendError(res, 400, 'gameState 必须是对象');

    const sessionUserId = getSessionUserId(req);
    if (sessionUserId && sessionUserId !== userId) return sendError(res, 403, '无权限保存该用户');

    const current = statements.getUser.get(userId);
    const mergedGameState = gameState && typeof gameState === 'object' ? gameState : current ? parseGameState(current.gameState) : {};
    const serializedState = JSON.stringify(mergedGameState);
    if (Buffer.byteLength(serializedState, 'utf8') > MAX_GAME_STATE_BYTES) return sendError(res, 413, '存档过大');

    const normalizedName = normalizeUsername(username || current?.username, userId);
    const stats = deriveStats(mergedGameState, Number(coins));
    upsertUserWithLog({
      userId,
      username: normalizedName,
      coins: stats.coins,
      gameState: serializedState,
      level: stats.level,
      totalCoinsEarned: stats.totalCoinsEarned
    });
    const updated = statements.getUser.get(userId);
    res.json({ success: true, data: toUserResponse(updated) });
  } catch (error) {
    console.error('save_user_failed', error);
    sendError(res, 500, '保存失败');
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = parseIntInRange(req.query.limit, 50, 1, 100);
    const offset = parseIntInRange(req.query.offset, 0, 0, 100000);
    const rows = statements.getLeaderboard.all(limit, offset);
    res.json({
      success: true,
      data: rows.map((row, index) => ({
        rank: offset + index + 1,
        ...row
      }))
    });
  } catch (error) {
    console.error('leaderboard_failed', error);
    sendError(res, 500, '排行榜读取失败');
  }
});

app.get('/api/leaderboard/:userId/rank', (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidUserId(userId)) return sendError(res, 400, '非法的 userId');
    const user = statements.getUser.get(userId);
    if (!user) return sendError(res, 404, '用户不存在');
    const rankRow = statements.getUserRank.get(userId);
    res.json({
      success: true,
      data: {
        userId,
        rank: rankRow?.rank || null,
        coins: user.coins,
        username: user.username
      }
    });
  } catch (error) {
    console.error('rank_failed', error);
    sendError(res, 500, '排名读取失败');
  }
});

app.get('/api/stats/summary', (req, res) => {
  try {
    const totalUsers = statements.getTotalUserCount.get().count;
    const activeUsers7d = statements.getActiveUserCount.get().count;
    const topUsers = statements.getLeaderboard.all(3, 0);
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers7d,
        topUsers
      }
    });
  } catch (error) {
    console.error('summary_failed', error);
    sendError(res, 500, '统计读取失败');
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    }
  }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return sendError(res, 404, '接口不存在');
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return sendError(res, 404, '接口不存在');
    res.status(503).json({ success: false, message: '前端资源不存在，请先执行 npm run build' });
  });
}

const server = app.listen(PORT, HOST, () => {
  console.log(`server_started host=${HOST} port=${PORT} db=${DB_PATH}`);
});

const gracefulShutdown = (signal) => {
  console.log(`server_shutdown signal=${signal}`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
