import React, { useState } from 'react';
import { GameState, MineType } from '../types';
import { MINES, getPlayerStats } from '../gameLogic';
import { Mountain, Lock, CheckCircle2, Users, Swords, AlertTriangle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../sound';

interface MineProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setActiveTab: (tab: string) => void;
}

export default function Mine({ state, setState, setActiveTab }: MineProps) {
  const [selectedBossMine, setSelectedBossMine] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<{ win: boolean; log: string[] } | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  
  const playerStats = getPlayerStats(state);

  const handleEquip = (mineId: MineType) => {
    soundManager.playClick();
    setState(prev => prev ? { ...prev, currentMine: mineId } : prev);
  };

  const handleChallengeBoss = (mine: any) => {
    if (state.coins < (mine.bossCost || 0)) {
      alert('金币不足以发起挑战！');
      return;
    }

    setIsBattling(true);
    soundManager.playClick();
    
    setState(prev => prev ? { ...prev, coins: prev.coins - (mine.bossCost || 0) } : prev);

    setTimeout(() => {
      const playerPower = playerStats.power * (0.8 + Math.random() * 0.4);
      const enemyPower = (mine.bossPower || 0) * (0.8 + Math.random() * 0.4);
      
      const win = playerPower > enemyPower;
      const log = [
        `挑战开始！你面对着【${mine.bossName}】。`,
        `你的战斗力评估: ${Math.floor(playerPower)}`,
        `领主的战斗力评估: ${Math.floor(enemyPower)}`
      ];

      if (win) {
        log.push(`🎉 战斗胜利！你成功击败了领主，矿洞已完全解锁！`);
        setState(prev => {
          if (!prev) return prev;
          const newDefeated = [...(prev.defeatedBosses || [])];
          if (!newDefeated.includes(mine.id)) {
            newDefeated.push(mine.id);
          }
          return { ...prev, defeatedBosses: newDefeated, currentMine: mine.id };
        });
        setBattleResult({ win: true, log });
        soundManager.playLevelUp();
      } else {
        log.push(`💀 战斗失败！你的实力还不足以抗衡这股力量。`);
        setBattleResult({ win: false, log });
      }
      
      setIsBattling(false);
    }, 1500);
  };

  return (
    <div className="p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 rounded-2xl border-4 border-white shadow-sm">
          <Mountain className="text-emerald-500" size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">矿洞系统</h1>
          <p className="text-sm text-white/80 font-bold">选择不同的矿洞探索</p>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('miners');
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95"
        >
          <div className="p-2 bg-orange-100 rounded-xl text-orange-500">
            <Users size={20} />
          </div>
          <span className="font-black text-slate-700 text-xs">矿工管理</span>
        </button>
      </div>

      <div className="space-y-4">
        {MINES.map((mine) => {
          const isHouseUnlocked = state.houseLevel >= mine.reqHouse;
          const isBossDefeated = !mine.bossPower || (state.defeatedBosses && state.defeatedBosses.includes(mine.id));
          const isFullyUnlocked = isHouseUnlocked && isBossDefeated;
          const isEquipped = state.currentMine === mine.id;

          return (
            <motion.div
              key={mine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 transition-all ${
                isEquipped ? 'border-emerald-400 bg-emerald-50/80' : 'border-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 shadow-inner ${isHouseUnlocked ? 'bg-emerald-100 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
                    {isHouseUnlocked ? <span className="text-3xl drop-shadow-sm">⛰️</span> : <Lock className="text-slate-400" size={28} />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isHouseUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>{mine.name}</h3>
                    <p className={`text-sm font-bold ${isHouseUnlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {!isHouseUnlocked ? `需要房屋等级 ${mine.reqHouse} 解锁` : !isBossDefeated ? `有强大的领主镇守` : `宝石爆率 x${mine.gemMultiplier}`}
                    </p>
                  </div>
                </div>
                {isEquipped && (
                  <div className="bg-emerald-100 text-emerald-600 border-2 border-emerald-200 px-3 py-1.5 rounded-full text-sm font-black flex items-center gap-1 shadow-sm">
                    <CheckCircle2 size={16} /> 探索中
                  </div>
                )}
              </div>

              {isHouseUnlocked && !isBossDefeated && (
                <button
                  onClick={() => setSelectedBossMine(mine)}
                  className="w-full py-4 rounded-2xl font-black text-lg bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30 transition-all active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <Swords size={20} /> 挑战领主
                </button>
              )}

              {isFullyUnlocked && !isEquipped && (
                <button
                  onClick={() => handleEquip(mine.id)}
                  className="w-full py-4 rounded-2xl font-black text-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 shadow-sm transition-all active:translate-y-1"
                >
                  进入矿洞
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      {/* Boss Confirmation Modal */}
      <AnimatePresence>
        {selectedBossMine && !isBattling && !battleResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedBossMine(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 border-rose-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-rose-900/50 rounded-full flex items-center justify-center border-4 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                  <span className="text-4xl">👹</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 text-center">挑战领主</h2>
              <p className="text-rose-400 text-center mb-6 font-bold text-lg">{selectedBossMine.bossName}</p>
              
              <div className="bg-slate-900 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 font-bold">挑战消耗</span>
                  <span className="text-amber-400 font-black flex items-center gap-1">💰 {selectedBossMine.bossCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 font-bold">我的战力</span>
                  <span className="text-sky-400 font-black flex items-center gap-1"><Shield size={16} /> {playerStats.power.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">领主战力</span>
                  <span className="text-rose-400 font-black flex items-center gap-1"><Swords size={16} /> {selectedBossMine.bossPower?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedBossMine(null)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black transition-colors"
                >
                  暂避锋芒
                </button>
                <button 
                  onClick={() => handleChallengeBoss(selectedBossMine)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black shadow-lg shadow-rose-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Swords size={18} /> 开战
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battling Overlay */}
      <AnimatePresence>
        {isBattling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-rose-500 mb-6"
            >
              <Swords size={64} />
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-widest animate-pulse">激战领主中...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {battleResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 ${battleResult.win ? 'bg-emerald-900 border-emerald-500' : 'bg-rose-900 border-rose-500'}`}
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-2 block">{battleResult.win ? '🏆' : '💀'}</span>
                <h2 className={`text-3xl font-black ${battleResult.win ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {battleResult.win ? '挑战成功！' : '挑战失败！'}
                </h2>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 mb-6 space-y-2">
                {battleResult.log.map((line, idx) => (
                  <div key={idx} className="text-sm font-bold text-slate-300">{line}</div>
                ))}
              </div>

              <button 
                onClick={() => {
                  setBattleResult(null);
                  setSelectedBossMine(null);
                }}
                className={`w-full py-4 rounded-xl font-black text-white transition-colors ${battleResult.win ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
              >
                确定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
