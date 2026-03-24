import { GameState, GemType, DigResult, ShovelType, MaterialType, MineType, UniqueGear, GearSlot, GearRarity, Opponent } from './types';

export const INITIAL_SHOVELS = 1000;

export const MATERIAL_TYPES: MaterialType[] = ['木材', '砖块', '水泥', '玻璃', '钢材'];

export const HOUSES = [
  { id: 0, name: '无', req: {}, capacity: 50, critRate: 0, coinBoost: 1, shovelsPerHour: 0, maxMiners: 1, minerSpeedBoost: 0 },
  { id: 1, name: '小木屋', req: { '木材': 10, '砖块': 5 }, capacity: 100, critRate: 0.05, coinBoost: 1.2, shovelsPerHour: 30, maxMiners: 2, minerSpeedBoost: 5 },
  { id: 2, name: '石屋', req: { '木材': 30, '砖块': 20, '水泥': 5 }, capacity: 200, critRate: 0.1, coinBoost: 1.5, shovelsPerHour: 60, maxMiners: 3, minerSpeedBoost: 10 },
  { id: 3, name: '小别墅', req: { '木材': 80, '砖块': 50, '水泥': 20, '玻璃': 5, '钢材': 2 }, capacity: 500, critRate: 0.15, coinBoost: 2, shovelsPerHour: 120, maxMiners: 5, minerSpeedBoost: 20 },
  { id: 4, name: '豪华别墅', req: { '砖块': 150, '水泥': 80, '玻璃': 30, '钢材': 10, '黑宝石': 10 }, capacity: 1000, critRate: 0.2, coinBoost: 3, shovelsPerHour: 240, maxMiners: 10, minerSpeedBoost: 30 },
  { id: 5, name: '庄园', req: { '水泥': 300, '玻璃': 150, '钢材': 50, '黑宝石': 30, '白宝石': 10 }, capacity: 2000, critRate: 0.25, coinBoost: 4, shovelsPerHour: 480, maxMiners: 15, minerSpeedBoost: 50 },
  { id: 6, name: '城堡', req: { '玻璃': 500, '钢材': 200, '白宝石': 30, '绿宝石': 5 }, capacity: 5000, critRate: 0.3, coinBoost: 5, shovelsPerHour: 960, maxMiners: 25, minerSpeedBoost: 80 },
  { id: 7, name: '王宫', req: { '玻璃': 1000, '钢材': 500, '绿宝石': 20, '红宝石': 5 }, capacity: 10000, critRate: 0.4, coinBoost: 10, shovelsPerHour: 1920, maxMiners: 40, minerSpeedBoost: 120 },
  { id: 8, name: '天空之城', req: { '钢材': 2000, '红宝石': 50, '蓝宝石': 10 }, capacity: 20000, critRate: 0.5, coinBoost: 15, shovelsPerHour: 3840, maxMiners: 60, minerSpeedBoost: 200 },
  { id: 9, name: '星际要塞', req: { '钢材': 5000, '蓝宝石': 30, '七彩宝石': 5 }, capacity: 50000, critRate: 0.6, coinBoost: 25, shovelsPerHour: 7680, maxMiners: 80, minerSpeedBoost: 300 },
  { id: 10, name: '宇宙神殿', req: { '钢材': 15000, '蓝宝石': 100, '七彩宝石': 20 }, capacity: 100000, critRate: 0.8, coinBoost: 50, shovelsPerHour: 15360, maxMiners: 100, minerSpeedBoost: 500 },
  { id: 11, name: '创世神域', req: { '钢材': 40000, '七彩宝石': 100 }, capacity: 250000, critRate: 1.0, coinBoost: 100, shovelsPerHour: 30720, maxMiners: 150, minerSpeedBoost: 800 },
  { id: 12, name: '维度枢纽', req: { '钢材': 100000, '七彩宝石': 300 }, capacity: 600000, critRate: 1.2, coinBoost: 200, shovelsPerHour: 61440, maxMiners: 200, minerSpeedBoost: 1200 },
  { id: 13, name: '永恒之境', req: { '钢材': 300000, '七彩宝石': 1000 }, capacity: 1500000, critRate: 1.5, coinBoost: 500, shovelsPerHour: 122880, maxMiners: 300, minerSpeedBoost: 2000 },
];

export const MINES: { id: MineType; reqHouse: number; gemMultiplier: number; name: string; bossName?: string; bossPower?: number; bossCost?: number }[] = [
  { id: '普通矿洞', name: '普通矿洞', reqHouse: 0, gemMultiplier: 1 },
  { id: '中级矿洞', name: '中级矿洞', reqHouse: 2, gemMultiplier: 1.5, bossName: '洞穴巨魔', bossPower: 500, bossCost: 1000 },
  { id: '高级矿洞', name: '高级矿洞', reqHouse: 4, gemMultiplier: 2.5, bossName: '深渊守卫', bossPower: 2500, bossCost: 5000 },
  { id: '传奇矿洞', name: '传奇矿洞', reqHouse: 6, gemMultiplier: 5, bossName: '熔岩炎魔', bossPower: 12000, bossCost: 20000 },
  { id: '神话矿洞', name: '神话矿洞', reqHouse: 8, gemMultiplier: 10, bossName: '星辰古龙', bossPower: 50000, bossCost: 100000 },
  { id: '虚空矿洞', name: '虚空矿洞', reqHouse: 9, gemMultiplier: 25, bossName: '虚空大君', bossPower: 200000, bossCost: 500000 },
  { id: '混沌矿洞', name: '混沌矿洞', reqHouse: 10, gemMultiplier: 50, bossName: '混沌之源', bossPower: 1000000, bossCost: 2000000 },
];

export const CHARACTERS = [
  { id: 'farmer', name: '农夫', emoji: '👨‍🌾', cost: 0 },
  { id: 'builder', name: '建筑工', emoji: '👷', cost: 1000 },
  { id: 'knight', name: '骑士', emoji: '🤺', cost: 5000 },
  { id: 'ninja', name: '忍者', emoji: '🥷', cost: 10000 },
  { id: 'pirate', name: '海盗', emoji: '🏴‍☠️', cost: 20000 },
  { id: 'astronaut', name: '宇航员', emoji: '🧑‍🚀', cost: 50000 },
  { id: 'robot', name: '机器人', emoji: '🤖', cost: 100000 },
  { id: 'demon', name: '恶魔', emoji: '👿', cost: 200000 },
  { id: 'angel', name: '天使', emoji: '👼', cost: 500000 },
  { id: 'reaper', name: '死神', emoji: '💀', cost: 1000000 },
];

export const SHOVELS: { id: ShovelType; name: string; fragment?: GemType; cost: number; multiplier: number; color: string; durability?: number }[] = [
  { id: '普通铁铲子', name: '普通铁铲子', cost: 0, multiplier: 1, color: 'text-slate-400' },
  { id: '银铲子', name: '银铲子', fragment: '银铲子碎片', cost: 10, multiplier: 1.5, color: 'text-slate-300 drop-shadow-md', durability: 50 },
  { id: '金铲子', name: '金铲子', fragment: '金铲子碎片', cost: 10, multiplier: 2, color: 'text-yellow-400 drop-shadow-md', durability: 100 },
  { id: '七彩铲子', name: '七彩铲子', fragment: '七彩铲子碎片', cost: 10, multiplier: 5, color: 'text-fuchsia-500 drop-shadow-lg', durability: 200 },
];

export const SHOVEL_MULTIPLIERS: Record<ShovelType, number> = {
  '普通铁铲子': 1,
  '银铲子': 1.5,
  '金铲子': 2,
  '七彩铲子': 5,
};

export const GEM_VALUES: Partial<Record<GemType, number>> = {
  '七彩宝石': 5000,
  '蓝宝石': 1000,
  '红宝石': 200,
  '绿宝石': 100,
  '白宝石': 10,
  '黑宝石': 2,
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirements?: Partial<Record<GemType, number>>;
  materialReqs?: Partial<Record<MaterialType, number>>;
  houseReq?: number;
  minerReq?: number;
  rewardCoins: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', name: '初识黑曜', description: '收集10颗黑宝石', requirements: { '黑宝石': 10 }, rewardCoins: 100 },
  { id: 'ach_2', name: '黑曜石收藏家', description: '收集50颗黑宝石', requirements: { '黑宝石': 50 }, rewardCoins: 500 },
  { id: 'ach_3', name: '黑曜石大亨', description: '收集200颗黑宝石', requirements: { '黑宝石': 200 }, rewardCoins: 2000 },
  
  { id: 'ach_4', name: '纯洁之白', description: '收集10颗白宝石', requirements: { '白宝石': 10 }, rewardCoins: 500 },
  { id: 'ach_5', name: '白玉无瑕', description: '收集50颗白宝石', requirements: { '白宝石': 50 }, rewardCoins: 2500 },
  { id: 'ach_6', name: '白宝石之王', description: '收集200颗白宝石', requirements: { '白宝石': 200 }, rewardCoins: 10000 },

  { id: 'ach_7', name: '生机之绿', description: '收集5颗绿宝石', requirements: { '绿宝石': 5 }, rewardCoins: 1000 },
  { id: 'ach_8', name: '翡翠梦境', description: '收集20颗绿宝石', requirements: { '绿宝石': 20 }, rewardCoins: 5000 },
  { id: 'ach_9', name: '绿野仙踪', description: '收集100颗绿宝石', requirements: { '绿宝石': 100 }, rewardCoins: 25000 },

  { id: 'ach_10', name: '热情之红', description: '收集5颗红宝石', requirements: { '红宝石': 5 }, rewardCoins: 2000 },
  { id: 'ach_11', name: '猩红之月', description: '收集20颗红宝石', requirements: { '红宝石': 20 }, rewardCoins: 10000 },
  { id: 'ach_12', name: '红宝石领主', description: '收集100颗红宝石', requirements: { '红宝石': 100 }, rewardCoins: 50000 },

  { id: 'ach_13', name: '深邃之蓝', description: '收集2颗蓝宝石', requirements: { '蓝宝石': 2 }, rewardCoins: 5000 },
  { id: 'ach_14', name: '海洋之心', description: '收集10颗蓝宝石', requirements: { '蓝宝石': 10 }, rewardCoins: 25000 },
  { id: 'ach_15', name: '蓝宝石至尊', description: '收集50颗蓝宝石', requirements: { '蓝宝石': 50 }, rewardCoins: 150000 },

  { id: 'ach_16', name: '七彩奇迹', description: '收集1颗七彩宝石', requirements: { '七彩宝石': 1 }, rewardCoins: 50000 },
  { id: 'ach_17', name: '彩虹使者', description: '收集5颗七彩宝石', requirements: { '七彩宝石': 5 }, rewardCoins: 300000 },
  
  { id: 'ach_18', name: '三色光辉', description: '收集红、绿、蓝宝石各10颗', requirements: { '红宝石': 10, '绿宝石': 10, '蓝宝石': 10 }, rewardCoins: 100000 },
  { id: 'ach_19', name: '五彩斑斓', description: '收集黑、白、红、绿、蓝宝石各20颗', requirements: { '黑宝石': 20, '白宝石': 20, '红宝石': 20, '绿宝石': 20, '蓝宝石': 20 }, rewardCoins: 500000 },
  { id: 'ach_20', name: '大满贯', description: '收集所有种类宝石各1颗', requirements: { '黑宝石': 1, '白宝石': 1, '红宝石': 1, '绿宝石': 1, '蓝宝石': 1, '七彩宝石': 1 }, rewardCoins: 1000000 },

  // New achievements
  { id: 'ach_21', name: '伐木工', description: '收集1000个木材', materialReqs: { '木材': 1000 }, rewardCoins: 5000 },
  { id: 'ach_22', name: '砖块大师', description: '收集1000个砖块', materialReqs: { '砖块': 1000 }, rewardCoins: 5000 },
  { id: 'ach_23', name: '钢铁洪流', description: '收集1000个钢材', materialReqs: { '钢材': 1000 }, rewardCoins: 20000 },
  
  { id: 'ach_24', name: '银色闪光', description: '收集10个银铲子碎片', requirements: { '银铲子碎片': 10 }, rewardCoins: 10000 },
  { id: 'ach_25', name: '黄金时代', description: '收集10个金铲子碎片', requirements: { '金铲子碎片': 10 }, rewardCoins: 50000 },
  { id: 'ach_26', name: '七彩传说', description: '收集10个七彩铲子碎片', requirements: { '七彩铲子碎片': 10 }, rewardCoins: 200000 },

  { id: 'ach_27', name: '包工头', description: '雇佣10名矿工', minerReq: 10, rewardCoins: 10000 },
  { id: 'ach_28', name: '矿业大亨', description: '雇佣50名矿工', minerReq: 50, rewardCoins: 100000 },
  
  { id: 'ach_29', name: '乔迁新居', description: '将房屋升级至小别墅', houseReq: 3, rewardCoins: 20000 },
  { id: 'ach_30', name: '城堡之主', description: '将房屋升级至城堡', houseReq: 6, rewardCoins: 200000 },
  { id: 'ach_31', name: '宇宙主宰', description: '将房屋升级至宇宙神殿', houseReq: 10, rewardCoins: 5000000 },
];

export const SCENES = [
  {
    id: 'wild_west',
    name: '西部戈壁',
    cost: 0,
    background: 'linear-gradient(to bottom, #d97706, #78350f)',
    description: '经典的美国西部戈壁风格，黄沙漫天。'
  },
  {
    id: 'crystal_cave',
    name: '水晶洞穴',
    cost: 10000,
    background: 'linear-gradient(to bottom, #4f46e5, #312e81)',
    description: '闪烁着神秘光芒的地下洞穴。'
  },
  {
    id: 'lava_land',
    name: '熔岩火山',
    cost: 50000,
    background: 'linear-gradient(to bottom, #ef4444, #7f1d1d)',
    description: '炽热的岩浆在脚下流淌。'
  },
  {
    id: 'frozen_tundra',
    name: '极寒冰原',
    cost: 100000,
    background: 'linear-gradient(to bottom, #38bdf8, #0c4a6e)',
    description: '被冰雪覆盖的古老冻土。'
  },
  {
    id: 'mystic_forest',
    name: '迷雾森林',
    cost: 200000,
    background: 'linear-gradient(to bottom, #10b981, #14532d)',
    description: '充满生机与未知的远古森林。'
  },
  {
    id: 'deep_ocean',
    name: '深海遗迹',
    cost: 500000,
    background: 'linear-gradient(to bottom, #0284c7, #082f49)',
    description: '沉睡在海底的亚特兰蒂斯。'
  },
  {
    id: 'starry_space',
    name: '星际迷航',
    cost: 1000000,
    background: 'linear-gradient(to bottom, #1e1b4b, #000000)',
    description: '浩瀚宇宙中的神秘陨石带。'
  },
  {
    id: 'golden_city',
    name: '黄金之城',
    cost: 5000000,
    background: 'linear-gradient(to bottom, #eab308, #854d0e)',
    description: '传说中遍地黄金的失落之城。'
  }
];

export const getTitleForLevel = (level: number): string => {
  if (level === 0) return '挖宝新手 Lv.0';
  
  // Calculate the sub-level (1-10) within the current title tier
  const subLevel = ((level - 1) % 10) + 1;

  if (level >= 1 && level <= 10) return `挖宝见习者 Lv.${subLevel}`;
  if (level >= 11 && level <= 20) return `挖宝小能手 Lv.${subLevel}`;
  if (level >= 21 && level <= 30) return `挖宝达人 Lv.${subLevel}`;
  if (level >= 31 && level <= 40) return `挖宝高手 Lv.${subLevel}`;
  if (level >= 41 && level <= 50) return `挖宝老手 Lv.${subLevel}`;
  if (level >= 51 && level <= 60) return `挖宝精英 Lv.${subLevel}`;
  if (level >= 61 && level <= 70) return `挖宝极客 Lv.${subLevel}`;
  if (level >= 71 && level <= 80) return `挖宝狂人 Lv.${subLevel}`;
  if (level >= 81 && level <= 90) return `挖宝至尊 Lv.${subLevel}`;
  
  // For levels above 90, we can just keep incrementing the subLevel
  const emperorSubLevel = level > 90 ? level - 90 : subLevel;
  return `挖宝皇帝 Lv.${emperorSubLevel}`;
};

export const getLevelUpRequirement = (level: number): number => {
  return level * 100;
};

export const getLevelFromXp = (xp: number): number => {
  let level = 1;
  let currentXp = xp;
  while (true) {
    const req = getLevelUpRequirement(level);
    if (currentXp >= req) {
      currentXp -= req;
      level++;
    } else {
      break;
    }
  }
  return level;
};

export const getCurrentLevelXp = (xp: number): number => {
  let level = 1;
  let currentXp = xp;
  while (true) {
    const req = getLevelUpRequirement(level);
    if (currentXp >= req) {
      currentXp -= req;
      level++;
    } else {
      break;
    }
  }
  return currentXp;
};

// --- New Drop System ---

export type DropTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const BASE_RATES = [
  { type: "common", rate: 0.85 },
  { type: "rare", rate: 0.11 },
  { type: "epic", rate: 0.03 },
  { type: "legendary", rate: 0.008 },
  { type: "mythic", rate: 0.002 }
];

export const TIER_ITEMS: Record<DropTier, (GemType | MaterialType)[]> = {
  common: ['木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '木材', '砖块', '砖块', '砖块', '砖块', '砖块', '砖块', '砖块', '砖块', '砖块', '砖块', '水泥', '水泥', '水泥', '水泥', '水泥', '黑宝石', '白宝石'],
  rare: ['玻璃', '玻璃', '钢材', '红宝石', '绿宝石', '银铲子碎片'],
  epic: ['蓝宝石', '蓝宝石', '金铲子碎片', '红宝石', '绿宝石'],
  legendary: ['七彩宝石', '七彩铲子碎片', '蓝宝石'],
  mythic: ['七彩宝石'] // Can be expanded
};

export const getProbabilities = (level: number) => {
  const luck = 1 + Math.pow(level, 1.2) / 50;
  
  const adjusted = BASE_RATES.map(r => ({
    ...r,
    rate: r.type === 'common' ? r.rate : r.rate * luck
  }));

  const total = adjusted.reduce((sum, r) => sum + r.rate, 0);

  const gems: Record<string, number> = {};
  const mats: Record<string, number> = {};

  adjusted.forEach(r => {
    const normalizedRate = r.rate / total;
    const items = TIER_ITEMS[r.type as DropTier];
    if (!items) return;
    const ratePerItem = normalizedRate / items.length;
    
    items.forEach(item => {
      if (['木材', '砖块', '水泥', '玻璃', '钢材'].includes(item)) {
        mats[item] = ratePerItem;
      } else {
        gems[item] = ratePerItem;
      }
    });
  });

  return { gems, mats };
};

/**
 * 核心掉落算法：
 * 1. 等级影响掉率：luck = 1 + (level^1.2)/50
 * 2. 分层掉落池：common 60%, rare 25%, epic 10%, legendary 4%, mythic 1%
 * 3. 概率动态调整并归一化
 * 4. 保底机制：20次未出 epic → 必出 epic，50次未出 legendary → 必出 legendary
 */
export function getDrop(level: number, pity: Record<string, number>, consecutiveDigs: number = 0) {
  // 1. 等级影响掉率 + 连续挖矿提升概率
  const luck = 1 + Math.pow(level, 1.2) / 50 + (consecutiveDigs * 0.005);

  // 4. 保底机制
  if (pity.legendary >= 50) return { type: "legendary" as DropTier, isPity: true };
  if (pity.epic >= 20) return { type: "epic" as DropTier, isPity: true };

  // 3. 概率调整与归一化
  const adjusted = BASE_RATES.map(r => ({
    ...r,
    rate: r.type === 'common' ? r.rate : r.rate * luck
  }));

  const total = adjusted.reduce((sum, r) => sum + r.rate, 0);
  let rand = Math.random() * total;

  for (let r of adjusted) {
    if (rand < r.rate) return { type: r.type as DropTier, isPity: false };
    rand -= r.rate;
  }

  return { type: "common" as DropTier, isPity: false };
}

export const performDig = (state: GameState, isMiner: boolean = false): { result: DigResult, newPrdCounters: Record<string, number> } => {
  const now = Date.now();
  const hasCoinBuff = state.activeBuffs.some(b => b.type === 'coin_boost' && b.expiresAt > now);
  const house = HOUSES[state.houseLevel] || HOUSES[0];
  const mine = MINES.find(m => m.id === state.currentMine) || MINES[0];

  // Check warehouse capacity
  const currentGemsCount = Object.entries(state.inventory).reduce((sum, [k, v]) => {
    if (k.includes('碎片')) return sum;
    return sum + v;
  }, 0);
  const isWarehouseFull = currentGemsCount >= house.capacity;

  // Base coins: 1-2 (保证每次都有金币，但数量极低)
  const stats = getPlayerStats(state);
  // 基础金币为 1，小概率(30%)给 2。
  const baseCoins = Math.random() < 0.3 ? 2 : 1; 
  let coinMultiplier = SHOVEL_MULTIPLIERS[state.equippedShovel] * house.coinBoost * (1 + stats.digSpeed);
  if (hasCoinBuff) coinMultiplier *= 1.2;
  // 进一步压缩金币获取乘数，使其在前期非常克制 (乘数系数从0.5降至0.3)
  let coinsEarned = Math.max(1, Math.floor(baseCoins * coinMultiplier * 0.3));

  const gemsEarned: GemType[] = [];
  const materialsEarned: MaterialType[] = [];
  let xpEarned = 5; // Base XP for digging
  let shovelsEarned = 0;
  
  const newPrdCounters = { ...state.prdCounters };
  const pity = {
    epic: newPrdCounters['epic_pity'] || 0,
    legendary: newPrdCounters['legendary_pity'] || 0
  };
  const consecutiveDigs = newPrdCounters['consecutive_digs'] || 0;
  
  // 前期高爆率控制：前20次必出 rare 或 epic
  const isEarlyGame = (state.totalDigs || 0) < 20;

  if (!isWarehouseFull) {
    let dropResult = getDrop(state.level, pity, consecutiveDigs);
    let tier = dropResult.type;

    if (isEarlyGame && tier === 'common') {
      tier = Math.random() < 0.2 ? 'epic' : 'rare'; // 前期保底
    }

    // 5. 暴击机制：有概率直接提升掉落品质
    let isCrit = false;
    if (Math.random() < house.critRate + 0.05) { // 基础暴击率 + 房屋暴击率
      isCrit = true;
      const tiers: DropTier[] = ["common", "rare", "epic", "legendary", "mythic"];
      const currentIndex = tiers.indexOf(tier);
      if (currentIndex < tiers.length - 1) {
        tier = tiers[currentIndex + 1];
      }
    }

    // 差一点出神话的提示逻辑
    let almostMythic = false;
    if (tier !== 'mythic' && Math.random() < 0.05) {
      almostMythic = true;
    }

    // 重置或增加保底计数
    if (tier === 'epic' || tier === 'legendary' || tier === 'mythic') {
      if (tier === 'epic') newPrdCounters['epic_pity'] = 0;
      if (tier === 'legendary' || tier === 'mythic') {
        newPrdCounters['legendary_pity'] = 0;
        newPrdCounters['epic_pity'] = 0;
      }
    } else {
      newPrdCounters['epic_pity'] = pity.epic + 1;
      newPrdCounters['legendary_pity'] = pity.legendary + 1;
    }

    newPrdCounters['consecutive_digs'] = consecutiveDigs + 1;

    // 抽取具体物品
    const itemsInTier = TIER_ITEMS[tier];
    const droppedItem = itemsInTier[Math.floor(Math.random() * itemsInTier.length)];

    // 大幅降低宝石获取概率：如果抽到宝石，有极高概率降级为基础材料（木材或砖块）
    let finalItem = droppedItem;
    if (!['木材', '砖块', '水泥', '玻璃', '钢材'].includes(droppedItem)) {
      if (tier === 'common') {
        // 普通奖池：85% 概率把黑/白宝石变成木材
        if (Math.random() < 0.85) finalItem = '木材';
      } else if (tier === 'rare') {
        // 稀有奖池：70% 概率把红/绿宝石或碎片变成砖块或玻璃
        if (Math.random() < 0.7) finalItem = Math.random() < 0.5 ? '砖块' : '玻璃';
      } else if (tier === 'epic') {
        // 史诗奖池：50% 概率降级为水泥或钢材
        if (Math.random() < 0.5) finalItem = Math.random() < 0.5 ? '水泥' : '钢材';
      }
    }

    if (['木材', '砖块', '水泥', '玻璃', '钢材'].includes(finalItem)) {
      materialsEarned.push(finalItem as MaterialType);
    } else {
      gemsEarned.push(finalItem as GemType);
      if (tier === 'epic' || tier === 'legendary' || tier === 'mythic') {
        xpEarned += 50;
      } else {
        xpEarned += 15;
      }
    }

    // 暴击时有概率双倍掉落
    if (isCrit && Math.random() < 0.5) {
      if (['木材', '砖块', '水泥', '玻璃', '钢材'].includes(finalItem)) {
        materialsEarned.push(finalItem as MaterialType);
      } else {
        gemsEarned.push(finalItem as GemType);
      }
    }

    // 矿工双倍产出技能
    if (isMiner) {
      const doubleDropSkillLevel = state.minerSkills?.['double_drop'] || 0;
      const doubleDropChance = (doubleDropSkillLevel * 1) / 100;
      if (Math.random() < doubleDropChance) {
        coinsEarned *= 2;
        xpEarned *= 2;
        if (gemsEarned.length > 0) gemsEarned.push(gemsEarned[0]);
        if (materialsEarned.length > 0) materialsEarned.push(materialsEarned[0]);
      }
    }

    if (Math.random() < 0.05) {
      shovelsEarned = Math.floor(Math.random() * 3) + 1;
    }

    // 装备掉落机制（每次挖矿有小概率掉落装备，受矿洞等级影响）
    let gearEarned: UniqueGear | undefined = undefined;
    const mineIndex = MINES.findIndex(m => m.id === state.currentMine);
    const gearDropChance = 0.15 + (mineIndex * 0.02); // 基础15%掉率，提升装备爆率
    
    if (Math.random() < gearDropChance) {
      gearEarned = generateRandomGear(mineIndex);
    }

    return { result: { coinsEarned, gemsEarned, materialsEarned, shovelsEarned, xpEarned, isCrit, almostMythic, gearEarned }, newPrdCounters };
  }

  return { result: { coinsEarned, gemsEarned: [], materialsEarned: [], shovelsEarned: 0, xpEarned }, newPrdCounters };
};

export const handleDurability = (state: GameState, digs: number): { newDurability: Record<string, number>, newEquipped: ShovelType, newUnlocked: ShovelType[] } => {
  if (state.equippedShovel === '普通铁铲子') return { newDurability: state.shovelDurability || {}, newEquipped: state.equippedShovel, newUnlocked: state.unlockedShovels };
  
  const currentDurability = (state.shovelDurability || {})[state.equippedShovel] || 0;
  const newDurabilityValue = Math.max(0, currentDurability - digs);
  
  const newDurability = { ...state.shovelDurability, [state.equippedShovel]: newDurabilityValue };
  
  let newEquipped: ShovelType = state.equippedShovel;
  let newUnlocked: ShovelType[] = [...state.unlockedShovels];
  
  if (newDurabilityValue === 0) {
    newEquipped = '普通铁铲子';
    newUnlocked = newUnlocked.filter(s => s !== state.equippedShovel);
  }
  
  return { newDurability, newEquipped, newUnlocked };
};

export const MINER_TIERS = [
  { level: 1, name: '普通矿工', digsPerMinute: 0.2, upgradeCost: 1000 },
  { level: 2, name: '熟练矿工', digsPerMinute: 0.4, upgradeCost: 5000 },
  { level: 3, name: '专家矿工', digsPerMinute: 1, upgradeCost: 20000 },
  { level: 4, name: '大师矿工', digsPerMinute: 2, upgradeCost: 100000 },
  { level: 5, name: '传奇矿工', digsPerMinute: 4, upgradeCost: 500000 },
  { level: 6, name: '神话矿工', digsPerMinute: 8, upgradeCost: 2000000 },
  { level: 7, name: '虚空矿工', digsPerMinute: 16, upgradeCost: 10000000 },
  { level: 8, name: '混沌矿工', digsPerMinute: 30, upgradeCost: 50000000 },
];

export interface MinerSkill {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  costCurrency: 'coins' | 'gem';
  gemType?: GemType;
  effectPerLevel: number;
  effectType: 'speed' | 'gemChance' | 'doubleDrop' | 'costReduction';
}

export const MINER_SKILLS: MinerSkill[] = [
  {
    id: 'speed_boost',
    name: '狂热挖掘',
    description: '提升矿工的基础挖掘速度',
    maxLevel: 20,
    baseCost: 5000,
    costMultiplier: 1.5,
    costCurrency: 'coins',
    effectPerLevel: 5, // +5% speed per level
    effectType: 'speed',
  },
  {
    id: 'gem_finder',
    name: '寻宝直觉',
    description: '提高矿工挖出宝石的概率',
    maxLevel: 10,
    baseCost: 10,
    costMultiplier: 1.2,
    costCurrency: 'gem',
    gemType: '红宝石',
    effectPerLevel: 2, // +2% gem chance per level
    effectType: 'gemChance',
  },
  {
    id: 'double_drop',
    name: '双倍惊喜',
    description: '矿工挖宝时有概率获得双倍产出',
    maxLevel: 10,
    baseCost: 5,
    costMultiplier: 1.5,
    costCurrency: 'gem',
    gemType: '蓝宝石',
    effectPerLevel: 1, // +1% double drop chance per level
    effectType: 'doubleDrop',
  },
  {
    id: 'cost_reduction',
    name: '精打细算',
    description: '降低雇佣和升级矿工的金币消耗',
    maxLevel: 15,
    baseCost: 20000,
    costMultiplier: 1.4,
    costCurrency: 'coins',
    effectPerLevel: 2, // -2% cost per level
    effectType: 'costReduction',
  },
];

export const getInitialState = (): GameState => {
  const today = new Date().toISOString().split('T')[0];
  return {
    coins: 0,
    totalCoinsEarned: 0,
    level: 1,
    xp: 0,
    shovels: INITIAL_SHOVELS,
    lastResetDate: today,
    inventory: {
      '七彩宝石': 0,
      '蓝宝石': 0,
      '红宝石': 0,
      '绿宝石': 0,
      '白宝石': 0,
      '黑宝石': 0,
      '银铲子碎片': 0,
      '金铲子碎片': 0,
      '七彩铲子碎片': 0,
    },
    materials: {
      '木材': 0,
      '砖块': 0,
      '水泥': 0,
      '玻璃': 0,
      '钢材': 0,
    },
    houseLevel: 0,
    currentMine: '普通矿洞',
    unlockedMines: ['普通矿洞'],
    equippedSkin: 'farmer',
    unlockedSkins: ['farmer'],
    equippedShovel: '普通铁铲子',
    unlockedShovels: ['普通铁铲子'],
    activeBuffs: [],
    prdCounters: {
      'epic_pity': 0,
      'legendary_pity': 0,
      'consecutive_digs': 0,
    },
    isAutoDigging: false,
    ownedScenes: ['wild_west'],
    currentScene: 'wild_west',
    unlockedAchievements: [],
    discoveredGems: [],
    lastLoginDate: '',
    consecutiveLogins: 0,
    minerCount: 0,
    minerLevel: 1,
    lastLogoutTime: Date.now(),
    minerSkills: {},
    inventoryGear: [],
    equippedGear: {},
    questsProgress: {},
    completedQuests: [],
    totalDigs: 0,
    customSkins: {},
    customGems: {},
    customHouses: {},
    shovelDurability: {},
    friends: [
      { id: 'f1', name: '挖宝大师', level: 50, houseLevel: 8, lastGiftTime: 0, avatar: '👨‍🌾' },
      { id: 'f2', name: '寻宝猎人', level: 25, houseLevel: 4, lastGiftTime: 0, avatar: '🥷' },
      { id: 'f3', name: '矿业大亨', level: 80, houseLevel: 12, lastGiftTime: 0, avatar: '🤖' }
    ],
    tutorialCompleted: false,
    defeatedBosses: ['普通矿洞']
  };
};

export const loadState = (): GameState => {
  try {
    const saved = localStorage.getItem('treasure_game_state_v2');
    if (saved) {
      const state = JSON.parse(saved) as GameState;
      const today = new Date().toISOString().split('T')[0];
      if (state.lastResetDate !== today) {
        state.shovels = INITIAL_SHOVELS;
        state.lastResetDate = today;
      }
      // Migrate old saves
      if (state.level === 0) state.level = 1;
      if (state.xp === undefined) state.xp = 0;
      if (!state.materials) state.materials = getInitialState().materials;
      if (state.houseLevel === undefined) state.houseLevel = 0;
      if (!state.currentMine) state.currentMine = '普通矿洞';
      if (!state.unlockedMines) state.unlockedMines = ['普通矿洞'];
      if (!state.equippedSkin || state.equippedSkin === 'default') state.equippedSkin = 'farmer';
      if (!state.unlockedSkins || state.unlockedSkins.includes('default')) state.unlockedSkins = ['farmer'];
      if (!state.equippedShovel) state.equippedShovel = '普通铁铲子';
      if (!state.unlockedShovels) state.unlockedShovels = ['普通铁铲子'];
      if (state.isAutoDigging === undefined) state.isAutoDigging = false;
      if (!state.activeBuffs) state.activeBuffs = [];
      if (!state.prdCounters) state.prdCounters = getInitialState().prdCounters;
      if (!state.ownedScenes) state.ownedScenes = ['wild_west'];
      if (!state.currentScene) state.currentScene = 'wild_west';
      if (!state.unlockedAchievements) state.unlockedAchievements = [];
      if (!state.discoveredGems) state.discoveredGems = [];
      if (!state.lastLoginDate) state.lastLoginDate = '';
      if (state.consecutiveLogins === undefined) state.consecutiveLogins = 0;
      if (state.minerCount === undefined) state.minerCount = 0;
      if (state.minerLevel === undefined) state.minerLevel = 1;
      if (state.lastLogoutTime === undefined) state.lastLogoutTime = Date.now();
      if (!state.minerSkills) state.minerSkills = {};
      if (!state.inventoryGear) state.inventoryGear = [];
      
      // Migrate old string-based equipped gear to the new complex gear system if needed
      if (!state.equippedGear || typeof Object.values(state.equippedGear)[0] === 'string') {
        state.equippedGear = {};
      }
      
      if (!state.questsProgress) state.questsProgress = {};
      if (!state.completedQuests) state.completedQuests = [];
      if (state.totalDigs === undefined) state.totalDigs = 0;
      if (!state.customSkins) state.customSkins = {};
      if (!state.customGems) state.customGems = {};
      if (!state.customHouses) state.customHouses = {};
      if (!state.shovelDurability) state.shovelDurability = {};
      if (!state.friends) state.friends = [
        { id: 'f1', name: '挖宝大师', level: 50, houseLevel: 8, lastGiftTime: 0, avatar: '👨‍🌾' },
        { id: 'f2', name: '寻宝猎人', level: 25, houseLevel: 4, lastGiftTime: 0, avatar: '🥷' },
        { id: 'f3', name: '矿业大亨', level: 80, houseLevel: 12, lastGiftTime: 0, avatar: '🤖' }
      ];
      if (state.tutorialCompleted === undefined) state.tutorialCompleted = false;
      if (!state.defeatedBosses) state.defeatedBosses = ['普通矿洞'];
      
      return state;
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return getInitialState();
};

export const saveState = (state: GameState) => {
  try {
    const stateToSave = { ...state, lastLogoutTime: Date.now() };
    localStorage.setItem('treasure_game_state_v2', JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const OPPONENTS: Opponent[] = [
  { id: 'opp_1', name: '菜鸟矿工', description: '刚入行的新手，动作生疏。', power: 50, rewardCoins: 500, rewardGems: ['黑宝石', '白宝石'], rewardMaterials: ['木材', '砖块'], costCoins: 100 },
  { id: 'opp_2', name: '熟练矿工', description: '有一定经验，手脚麻利。', power: 300, rewardCoins: 2000, rewardGems: ['黑宝石', '绿宝石'], rewardMaterials: ['木材', '砖块', '水泥'], costCoins: 500 },
  { id: 'opp_3', name: '资深探险家', description: '常年混迹矿洞，经验老道。', power: 1500, rewardCoins: 8000, rewardGems: ['白宝石', '红宝石'], rewardMaterials: ['水泥', '玻璃'], costCoins: 2000 },
  { id: 'opp_4', name: '矿场恶霸', description: '霸占一方的狠角色，装备精良。', power: 5000, rewardCoins: 30000, rewardGems: ['蓝宝石', '绿宝石'], rewardMaterials: ['玻璃', '钢材'], costCoins: 8000 },
  { id: 'opp_5', name: '地底之王', description: '传说中的挖矿之神，无人能及。', power: 20000, rewardCoins: 100000, rewardGems: ['七彩宝石', '蓝宝石'], rewardMaterials: ['钢材'], costCoins: 25000 },
];

export const getPlayerStats = (state: GameState) => {
  let attack = state.level * 5;
  let defense = state.level * 2;
  let hp = state.level * 20 + 100;
  let critRate = 0;
  let critDamage = 1.5;
  let dodgeRate = 0;
  let counterRate = 0;
  let vampRate = 0;
  let plunderBonus = 0;
  let digSpeed = 0;

  if (state.equippedGear) {
    Object.values(state.equippedGear).forEach(gear => {
      if (gear) {
        attack += gear.baseStats.attack || 0;
        defense += gear.baseStats.defense || 0;
        hp += gear.baseStats.hp || 0;
        if (gear.subStats.critRate) critRate += gear.subStats.critRate;
        if (gear.subStats.critDamage) critDamage += gear.subStats.critDamage;
        if (gear.subStats.dodgeRate) dodgeRate += gear.subStats.dodgeRate;
        if (gear.subStats.counterRate) counterRate += gear.subStats.counterRate;
        if (gear.subStats.vampRate) vampRate += gear.subStats.vampRate;
        if (gear.subStats.plunderBonus) plunderBonus += gear.subStats.plunderBonus;
        if (gear.subStats.digSpeed) digSpeed += gear.subStats.digSpeed;
      }
    });
  }

  // Combat Power Calculation Formula
  const power = Math.floor(
    (attack * 2 + defense * 1.5 + hp * 0.2) * 
    (1 + critRate * (critDamage - 1)) * 
    (1 + dodgeRate * 0.5) * 
    (1 + counterRate * 0.5) * 
    (1 + vampRate * 0.5)
  );

  return { attack, defense, hp, critRate, critDamage, dodgeRate, counterRate, vampRate, plunderBonus, digSpeed, power };
};

export const GEAR_DICTIONARY: Record<GearSlot, {name: string, icon: string}[]> = {
  weapon: [
    { name: '生锈铁剑', icon: '🗡️' }, { name: '精钢战斧', icon: '🪓' }, { name: '刺客匕首', icon: '🔪' },
    { name: '雷霆法杖', icon: '🪄' }, { name: '狂战巨剑', icon: '⚔️' }, { name: '龙骨长矛', icon: '🔱' },
    { name: '暗影弯刀', icon: '🗡️' }, { name: '星陨重锤', icon: '🔨' }, { name: '虚空刃', icon: '🗡️' }
  ],
  helmet: [
    { name: '破旧皮帽', icon: '🧢' }, { name: '铁面罩', icon: '🪖' }, { name: '骑士头盔', icon: '⛑️' },
    { name: '法师兜帽', icon: '🧙' }, { name: '龙鳞战盔', icon: '🐉' }, { name: '恶魔面具', icon: '👹' },
    { name: '星光王冠', icon: '👑' }, { name: '虚空灵纱', icon: '🌌' }
  ],
  armor: [
    { name: '粗布衣', icon: '👕' }, { name: '锁子甲', icon: '🦺' }, { name: '骑士板甲', icon: '🛡️' },
    { name: '暗影风衣', icon: '🧥' }, { name: '龙血重甲', icon: '🐉' }, { name: '星辰长袍', icon: '👘' },
    { name: '虚空胸甲', icon: '🌌' }
  ],
  boots: [
    { name: '草鞋', icon: '🥾' }, { name: '皮靴', icon: '👞' }, { name: '骑士长靴', icon: '👢' },
    { name: '风行步履', icon: '👟' }, { name: '龙骨战靴', icon: '🐉' }, { name: '踏星之履', icon: '⭐' },
    { name: '虚空之足', icon: '🌌' }
  ],
  accessory: [
    { name: '木质指环', icon: '💍' }, { name: '银护身符', icon: '🧿' }, { name: '红宝石项链', icon: '📿' },
    { name: '龙牙吊坠', icon: '🦷' }, { name: '星辰之眼', icon: '👁️' }, { name: '时空沙漏', icon: '⏳' },
    { name: '虚空核心', icon: '🔮' }
  ]
};

export const generateRandomGear = (mineLevelIndex: number): UniqueGear => {
  const slots: GearSlot[] = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  
  const rand = Math.random();
  let rarity: GearRarity = 'C';
  
  // Revised Drop Rates: Strongly gated by mineLevelIndex
  // mineLevelIndex from 0 (lowest) to 6 (highest)
  
  if (mineLevelIndex === 0) {
    if (rand < 0.05) rarity = 'A';
    else if (rand < 0.3) rarity = 'B';
    else rarity = 'C';
  } else if (mineLevelIndex === 1) {
    if (rand < 0.02) rarity = 'R';
    else if (rand < 0.1) rarity = 'A';
    else if (rand < 0.4) rarity = 'B';
    else rarity = 'C';
  } else if (mineLevelIndex === 2) {
    if (rand < 0.01) rarity = 'SR';
    else if (rand < 0.05) rarity = 'R';
    else if (rand < 0.2) rarity = 'A';
    else rarity = 'B';
  } else if (mineLevelIndex === 3) {
    if (rand < 0.01) rarity = 'SSR';
    else if (rand < 0.05) rarity = 'SR';
    else if (rand < 0.15) rarity = 'R';
    else rarity = 'A';
  } else if (mineLevelIndex === 4) {
    if (rand < 0.01) rarity = 'XR';
    else if (rand < 0.05) rarity = 'SSR';
    else if (rand < 0.2) rarity = 'SR';
    else rarity = 'R';
  } else if (mineLevelIndex === 5) {
    if (rand < 0.01) rarity = 'XXR';
    else if (rand < 0.05) rarity = 'XR';
    else if (rand < 0.2) rarity = 'SSR';
    else rarity = 'SR';
  } else {
    // mineLevelIndex >= 6
    if (rand < 0.005) rarity = 'MAX';
    else if (rand < 0.05) rarity = 'XXR';
    else if (rand < 0.2) rarity = 'XR';
    else rarity = 'SSR';
  }

  const rarityMultipliers: Record<GearRarity, number> = {
    'C': 1, 'B': 2, 'A': 4, 'R': 8, 'SR': 16, 'SSR': 32, 'XR': 64, 'XXR': 128, 'MAX': 300
  };

  const mult = rarityMultipliers[rarity] * (1 + mineLevelIndex * 0.5);
  const level = Math.max(1, mineLevelIndex * 10 + Math.floor(Math.random() * 10));

  const templates = GEAR_DICTIONARY[slot];
  // Higher rarity tends to pick from the end of the array
  const templateIndex = Math.min(templates.length - 1, Math.floor((Math.random() + (rarityMultipliers[rarity]/300)) * templates.length * 0.8));
  const template = templates[templateIndex];

  const gear: UniqueGear = {
    id: `gear_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: `${rarity} · ${template.name}`,
    icon: template.icon,
    slot,
    rarity,
    level,
    power: 0,
    baseStats: {
      attack: Math.floor((slot === 'weapon' ? 10 : slot === 'accessory' ? 5 : 2) * mult * level),
      defense: Math.floor((slot === 'armor' ? 10 : slot === 'helmet' ? 8 : slot === 'boots' ? 6 : 2) * mult * level),
      hp: Math.floor((slot === 'armor' ? 50 : slot === 'helmet' ? 30 : slot === 'boots' ? 20 : 10) * mult * level),
    },
    subStats: {}
  };

  const numSubStats = rarity === 'MAX' ? 6 : rarity === 'XXR' ? 5 : rarity === 'XR' ? 4 : rarity === 'SSR' ? 3 : rarity === 'SR' ? 2 : rarity === 'R' ? 1 : 0;
  const possibleSubs = ['critRate', 'critDamage', 'dodgeRate', 'counterRate', 'vampRate', 'plunderBonus', 'digSpeed'];
  
  for (let i = 0; i < numSubStats; i++) {
    const sub = possibleSubs[Math.floor(Math.random() * possibleSubs.length)] as keyof UniqueGear['subStats'];
    gear.subStats[sub] = (gear.subStats[sub] || 0) + (Math.random() * 0.05 * mult * (sub === 'critDamage' ? 5 : 1));
  }

  // Calculate power
  gear.power = Math.floor(
    (gear.baseStats.attack * 2 + gear.baseStats.defense * 1.5 + gear.baseStats.hp * 0.2) * 
    (1 + (gear.subStats.critRate || 0) * ((gear.subStats.critDamage || 0) + 0.5)) * 
    (1 + (gear.subStats.dodgeRate || 0) * 0.5) *
    (1 + (gear.subStats.counterRate || 0) * 0.5) *
    (1 + (gear.subStats.vampRate || 0) * 0.5)
  );

  return gear;
};
