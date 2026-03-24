import React, { useState } from 'react';
import { GameState } from '../types';
import { getPlayerStats, HOUSES, MINES, CHARACTERS } from '../gameLogic';
import { User, Zap, Target, Coins, Star, Trophy, BookOpen, Home, Mountain, Pickaxe, AlertTriangle, Users, Shield, Sword, Crosshair } from 'lucide-react';
import { motion } from 'motion/react';
import Leaderboard from './Leaderboard';
import Friends from './Friends';
import Equipment from './Equipment';
import Plunder from './Plunder';
import { soundManager } from '../sound';

interface MeProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  username: string;
  userId: string;
  myRank: number | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  onUpdateUsername: (name: string) => Promise<boolean>;
}

export default function Me({ state, setState, username, userId, myRank, syncStatus, onUpdateUsername }: MeProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showPlunder, setShowPlunder] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [isSavingName, setIsSavingName] = useState(false);
  const stats = getPlayerStats(state);
  const currentHouse = HOUSES[state.houseLevel] || HOUSES[0];
  const currentMine = MINES.find(m => m.id === state.currentMine) || MINES[0];
  const currentCharacter = CHARACTERS.find(c => c.id === state.equippedSkin) || CHARACTERS[0];

  const getTitle = () => {
    if (state.level < 5) return '见习矿工';
    if (state.level < 15) return '熟练矿工';
    if (state.level < 30) return '资深寻宝者';
    if (state.level < 50) return '寻宝大师';
    if (state.level < 80) return '传奇探险家';
    return '神话寻宝王';
  };

  const xpRequired = state.level * 1000;
  const xpProgress = Math.min(100, (state.xp / xpRequired) * 100);
  const syncTextMap: Record<MeProps['syncStatus'], string> = {
    idle: '待同步',
    syncing: '同步中',
    synced: '已同步',
    offline: '离线',
    error: '同步失败',
  };
  const syncColorMap: Record<MeProps['syncStatus'], string> = {
    idle: 'text-slate-500 bg-slate-100 border-slate-200',
    syncing: 'text-indigo-600 bg-indigo-100 border-indigo-200',
    synced: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    offline: 'text-amber-600 bg-amber-100 border-amber-200',
    error: 'text-rose-600 bg-rose-100 border-rose-200',
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === username || isSavingName) return;
    setIsSavingName(true);
    const ok = await onUpdateUsername(trimmed);
    setIsSavingName(false);
    if (!ok) {
      setNameInput(username);
      return;
    }
    soundManager.playClick();
  };

  React.useEffect(() => {
    setNameInput(username);
  }, [username]);

  if (showLeaderboard) {
    return <Leaderboard state={state} onBack={() => setShowLeaderboard(false)} />;
  }

  if (showFriends) {
    return <Friends state={state} setState={setState} onBack={() => setShowFriends(false)} />;
  }

  if (showEquipment) {
    return <Equipment state={state} setState={setState} onBack={() => setShowEquipment(false)} />;
  }

  if (showPlunder) {
    return <Plunder state={state} setState={setState} onBack={() => setShowPlunder(false)} />;
  }

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
          <User className="text-indigo-400" /> 我的主页
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowFriends(true);
            }}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border-2 border-white font-black text-indigo-500 flex items-center gap-2 hover:bg-white active:scale-95 transition-all"
          >
            <Users size={18} /> 好友
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setShowLeaderboard(true);
            }}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border-2 border-white font-black text-amber-500 flex items-center gap-2 hover:bg-white active:scale-95 transition-all"
          >
            <Trophy size={18} /> 排行榜
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl border-4 border-indigo-200 flex items-center justify-center text-4xl shadow-inner overflow-hidden">
            {state.customSkins?.[state.equippedSkin] ? (
              <img src={state.customSkins[state.equippedSkin]} alt="Skin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              currentCharacter.emoji
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{username || '游客'}</h2>
            <div className="text-xs font-bold text-slate-500 mt-1">ID: {userId ? `${userId.slice(0, 10)}...` : '未登录'}</div>
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-black mt-1 border border-amber-200">
              <Star size={12} /> {getTitle()}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <div className={`px-2 py-1 rounded-lg text-xs font-black border ${syncColorMap[syncStatus]}`}>
            云端状态：{syncTextMap[syncStatus]}
          </div>
          <div className="px-2 py-1 rounded-lg text-xs font-black border border-amber-200 bg-amber-100 text-amber-700">
            我的排名：{myRank ? `#${myRank}` : '未上榜'}
          </div>
        </div>

        <div className="flex gap-2 mb-4 relative z-10">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={24}
            placeholder="输入昵称"
            className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 font-bold text-slate-700 outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleSaveName}
            disabled={isSavingName || !nameInput.trim() || nameInput.trim() === username}
            className="px-4 py-2 rounded-xl font-black text-white bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-300 transition-colors"
          >
            {isSavingName ? '保存中' : '改名'}
          </button>
        </div>

        <div className="mb-2 flex justify-between items-end relative z-10">
          <span className="text-sm font-black text-slate-500">等级 {state.level}</span>
          <span className="text-xs font-bold text-slate-400">{state.xp} / {xpRequired} XP</span>
        </div>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border-2 border-slate-200 relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <h3 className="text-lg font-black text-white drop-shadow-md mb-4 flex items-center gap-2">
        <Zap size={20} className="text-amber-400" /> 战斗力与属性
      </h3>
      
      {/* Power */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl border-4 border-white mb-4 flex flex-col items-center text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="text-sm font-black text-indigo-200 mb-1 tracking-widest uppercase">综合战斗力</div>
        <div className="text-5xl font-black drop-shadow-lg flex items-center gap-2">
          <Zap size={36} className="text-amber-300" />
          {stats.power.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border-4 border-white flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center mb-2">
            <Sword size={20} />
          </div>
          <div className="text-xs font-bold text-slate-400 mb-1">攻击力</div>
          <div className="text-xl font-black text-rose-600">{Math.floor(stats.attack)}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border-4 border-white flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center mb-2">
            <Shield size={20} />
          </div>
          <div className="text-xs font-bold text-slate-400 mb-1">防御力</div>
          <div className="text-xl font-black text-sky-600">{Math.floor(stats.defense)}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border-4 border-white flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center mb-2">
            <Crosshair size={20} />
          </div>
          <div className="text-xs font-bold text-slate-400 mb-1">暴击/闪避</div>
          <div className="text-xl font-black text-amber-600">{Math.floor(stats.critRate * 100)}% / {Math.floor(stats.dodgeRate * 100)}%</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border-4 border-white flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center mb-2">
            <Pickaxe size={20} />
          </div>
          <div className="text-xs font-bold text-slate-400 mb-1">掠夺/挖掘加成</div>
          <div className="text-xl font-black text-emerald-600">+{Math.floor(stats.plunderBonus * 100)}% / +{Math.floor(stats.digSpeed * 100)}%</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => {
            soundManager.playClick();
            setShowPlunder(true);
          }}
          className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-4 shadow-md border-4 border-white flex flex-col items-center text-center text-white active:scale-95 transition-transform"
        >
          <Target size={32} className="mb-2" />
          <span className="font-black">掠夺玩家</span>
        </button>
      </div>

      {/* Account Data */}
      <h3 className="text-lg font-black text-white drop-shadow-md mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-rose-400" /> 生涯数据
      </h3>
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 border-white space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Coins className="text-amber-500" size={20} /> 累计获得金币
          </div>
          <div className="font-black text-amber-600 text-lg">{state.totalCoinsEarned.toLocaleString()}</div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <BookOpen className="text-rose-500" size={20} /> 解锁图鉴
          </div>
          <div className="font-black text-rose-600 text-lg">{state.discoveredGems.length} 种</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Trophy className="text-amber-500" size={20} /> 达成成就
          </div>
          <div className="font-black text-amber-600 text-lg">{state.unlockedAchievements.length} 个</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Home className="text-indigo-500" size={20} /> 当前房屋
          </div>
          <div className="font-black text-indigo-600 text-lg">{currentHouse.name}</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Mountain className="text-emerald-500" size={20} /> 当前矿洞
          </div>
          <div className="font-black text-emerald-600 text-lg">{currentMine.name}</div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-4 rounded-2xl font-black text-lg bg-red-50 hover:bg-red-100 text-red-500 border-2 border-red-200 shadow-sm transition-all active:translate-y-1 flex items-center justify-center gap-2"
        >
          <AlertTriangle size={20} /> 重新开始游戏
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-4 border-red-100"
          >
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-center text-slate-800 mb-2">警告</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              确定要清除所有游戏数据并重新开始吗？此操作不可恢复！
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('treasure_game_state_v2');
                  window.location.reload();
                }}
                className="flex-1 py-3 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
              >
                确定重置
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
