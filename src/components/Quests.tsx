import React from 'react';
import { GameState, Quest } from '../types';
import { QUESTS } from '../quests';
import { CheckCircle, Circle, Gift, Coins, Pickaxe, Star, Gem } from 'lucide-react';
import { soundManager } from '../sound';
import { getLevelFromXp } from '../gameLogic';
import { motion } from 'motion/react';

interface QuestsProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export default function Quests({ state, setState }: QuestsProps) {
  const getProgress = (quest: Quest) => {
    switch (quest.type) {
      case 'dig':
        return state.totalDigs || 0;
      case 'collect_coins':
        return state.totalCoinsEarned || 0;
      case 'hire_miner':
        return state.minerCount || 0;
      case 'upgrade_house':
        return state.houseLevel || 0;
      default:
        return state.questsProgress?.[quest.id] || 0;
    }
  };

  const handleClaim = (quest: Quest) => {
    soundManager.playLevelUp();
    setState(prev => {
      if (!prev) return prev;
      
      const newState = { ...prev };
      newState.completedQuests = [...(newState.completedQuests || []), quest.id];
      
      if (quest.rewardCoins) {
        newState.coins += quest.rewardCoins;
        newState.totalCoinsEarned += quest.rewardCoins;
      }
      if (quest.rewardShovels) {
        newState.shovels += quest.rewardShovels;
      }
      if (quest.rewardXp) {
        newState.xp += quest.rewardXp;
        newState.level = getLevelFromXp(newState.xp);
      }
      if (quest.rewardGems) {
        newState.inventory = { ...newState.inventory };
        Object.entries(quest.rewardGems).forEach(([gem, count]) => {
          newState.inventory[gem as any] = (newState.inventory[gem as any] || 0) + count;
        });
      }
      
      return newState;
    });
  };

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-2xl border-4 border-white shadow-sm">
          <Gift className="text-amber-500" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">任务系统</h1>
          <p className="text-sm text-white/80 font-bold">完成任务获取丰厚奖励</p>
        </div>
      </div>

      <div className="space-y-4">
        {QUESTS.map(quest => {
          const progress = getProgress(quest);
          const isCompleted = progress >= quest.target;
          const isClaimed = state.completedQuests?.includes(quest.id);

          return (
            <div 
              key={quest.id} 
              className={`bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 transition-all ${
                isClaimed ? 'border-slate-200 opacity-60' : 
                isCompleted ? 'border-emerald-400 bg-emerald-50/80' : 'border-white'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-black text-lg ${isClaimed ? 'text-slate-500' : 'text-slate-800'}`}>
                    {quest.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">{quest.description}</p>
                </div>
                {isClaimed ? (
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-xl">
                    <CheckCircle size={24} />
                  </div>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="bg-emerald-400 hover:bg-emerald-300 text-white px-4 py-2 rounded-xl font-black text-sm shadow-[0_4px_0_rgba(52,211,153,1)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    领取奖励
                  </button>
                ) : (
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-xl">
                    <Circle size={24} />
                  </div>
                )}
              </div>

              {!isClaimed && (
                <>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-3 border border-slate-300 relative">
                    <motion.div 
                      className={`absolute top-0 left-0 h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (progress / quest.target) * 100)}%` }}
                      transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                    />
                    {/* Add a subtle shine effect when progressing */}
                    {!isCompleted && progress > 0 && (
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ 
                          width: `${Math.min(100, (progress / quest.target) * 100)}%`,
                          opacity: [0, 0.5, 0] 
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">进度: {Math.floor(progress)} / {quest.target}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">奖励:</span>
                      {quest.rewardCoins && <span className="flex items-center gap-1 text-amber-500"><Coins size={12} /> {quest.rewardCoins}</span>}
                      {quest.rewardShovels && <span className="flex items-center gap-1 text-slate-500"><Pickaxe size={12} /> {quest.rewardShovels}</span>}
                      {quest.rewardXp && <span className="flex items-center gap-1 text-sky-500"><Star size={12} /> {quest.rewardXp}</span>}
                      {quest.rewardGems && Object.entries(quest.rewardGems).map(([gem, count]) => (
                        <span key={gem} className="flex items-center gap-1 text-fuchsia-500"><Gem size={12} /> {gem} x{count}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
