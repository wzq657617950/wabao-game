import React, { useState } from 'react';
import { GameState, GemType, MaterialType } from '../types';
import { GEM_VALUES, ACHIEVEMENTS } from '../gameLogic';
import { BookOpen, Lock, Trophy, CheckCircle2, Gift } from 'lucide-react';
import { soundManager } from '../sound';

interface MuseumProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  initialTab?: 'gems' | 'achievements';
}

const ALL_GEMS: GemType[] = [
  '黑宝石',
  '白宝石',
  '红宝石',
  '绿宝石',
  '蓝宝石',
  '七彩宝石',
  '银铲子碎片',
  '金铲子碎片',
  '七彩铲子碎片'
];

const GEM_EMOJIS: Record<string, string> = {
  '黑宝石': '🌑',
  '白宝石': '⚪',
  '红宝石': '🔴',
  '绿宝石': '🟢',
  '蓝宝石': '🔵',
  '七彩宝石': '🌈',
  '银铲子碎片': '🥄',
  '金铲子碎片': '🪙',
  '七彩铲子碎片': '✨'
};

export default function Museum({ state, setState, initialTab = 'gems' }: MuseumProps) {
  const [activeTab, setActiveTab] = useState<'gems' | 'achievements'>(initialTab);

  const handleClaimAchievement = (achievementId: string, rewardCoins: number) => {
    soundManager.playCoin();
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId]
      };
    });
  };

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
          {activeTab === 'gems' ? <BookOpen className="text-rose-400" /> : <Trophy className="text-amber-400" />} 
          {activeTab === 'gems' ? '宝石图鉴' : '成就系统'}
        </h1>
        {activeTab === 'gems' && (
          <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border-2 border-white font-bold text-rose-500 flex items-center gap-1">
            收集度: {state.discoveredGems.length}/{ALL_GEMS.length}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white/80 backdrop-blur-md border-4 border-white p-1.5 rounded-2xl mb-6 shadow-sm">
        <button 
          onClick={() => {
            soundManager.playClick();
            setActiveTab('gems');
          }}
          className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'gems' ? 'bg-rose-100 text-rose-600 shadow-sm border-2 border-rose-200' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <BookOpen size={18} /> 图鉴
        </button>
        <button 
          onClick={() => {
            soundManager.playClick();
            setActiveTab('achievements');
          }}
          className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'achievements' ? 'bg-amber-100 text-amber-600 shadow-sm border-2 border-amber-200' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <Trophy size={18} /> 成就
        </button>
      </div>

      {activeTab === 'gems' ? (
        <div className="grid grid-cols-3 gap-4">
          {ALL_GEMS.map((gem) => {
            const isDiscovered = state.discoveredGems.includes(gem);
            
            return (
              <div 
                key={gem}
                className={`relative aspect-square rounded-3xl flex flex-col items-center justify-center p-2 shadow-lg border-4 transition-all ${
                  isDiscovered 
                    ? 'bg-white border-white' 
                    : 'bg-slate-200/50 border-slate-300/50 grayscale opacity-70'
                }`}
              >
                {!isDiscovered && (
                  <div className="absolute top-2 right-2 text-slate-400">
                    <Lock size={16} />
                  </div>
                )}
                <div className="w-16 h-16 mb-2 drop-shadow-md overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100 border-2 border-slate-200">
                  {state.customGems?.[gem] ? (
                    <img src={state.customGems[gem]} alt={gem} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-4xl">{GEM_EMOJIS[gem] || (gem.includes('碎片') ? '🧩' : '💎')}</span>
                  )}
                </div>
                <div className={`text-xs font-black text-center ${isDiscovered ? 'text-slate-700' : 'text-slate-500'}`}>
                  {isDiscovered ? gem : '???'}
                </div>
                {isDiscovered && GEM_VALUES[gem] && (
                  <div className="absolute bottom-[-10px] bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm border border-white">
                    价值 {GEM_VALUES[gem]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = state.unlockedAchievements.includes(ach.id);
            
            // Check if requirements are met
            let reqMet = true;
            let progressText = '';
            
            if (ach.requirements) {
              for (const [gem, amount] of Object.entries(ach.requirements)) {
                const current = state.inventory[gem as GemType] || 0;
                if (current < amount) {
                  reqMet = false;
                }
                progressText = `${Math.min(current, amount)}/${amount}`;
              }
            }
            
            if (ach.materialReqs) {
              for (const [mat, amount] of Object.entries(ach.materialReqs)) {
                const current = state.materials[mat as MaterialType] || 0;
                if (current < amount) {
                  reqMet = false;
                }
                progressText = `${Math.min(current, amount)}/${amount}`;
              }
            }
            
            if (ach.houseReq) {
              if (state.houseLevel < ach.houseReq) {
                reqMet = false;
              }
              progressText = `${Math.min(state.houseLevel, ach.houseReq)}/${ach.houseReq}`;
            }
            
            if (ach.minerReq) {
              if (state.minerCount < ach.minerReq) {
                reqMet = false;
              }
              progressText = `${Math.min(state.minerCount, ach.minerReq)}/${ach.minerReq}`;
            }

            const canClaim = reqMet && !isUnlocked;

            return (
              <div 
                key={ach.id}
                className={`bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 transition-all ${
                  isUnlocked ? 'border-emerald-200 bg-emerald-50/50' : 
                  canClaim ? 'border-amber-400 shadow-amber-200/50' : 'border-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 ${
                      isUnlocked ? 'bg-emerald-100 border-emerald-200 text-emerald-500' : 
                      canClaim ? 'bg-amber-100 border-amber-200 text-amber-500' : 'bg-slate-100 border-slate-200 grayscale opacity-50'
                    }`}>
                      🏆
                    </div>
                    <div>
                      <h3 className={`font-black text-lg ${isUnlocked ? 'text-emerald-700' : 'text-slate-700'}`}>{ach.name}</h3>
                      <p className="text-sm font-bold text-slate-500">{ach.description}</p>
                    </div>
                  </div>
                  {isUnlocked && (
                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">进度: {progressText}</span>
                    <span className="text-xs font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                      <Gift size={12} /> {ach.rewardCoins}
                    </span>
                  </div>
                  
                  {!isUnlocked && (
                    <button
                      onClick={() => handleClaimAchievement(ach.id, ach.rewardCoins)}
                      disabled={!canClaim}
                      className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                        canClaim 
                          ? 'bg-amber-400 hover:bg-amber-300 text-white shadow-[0_4px_0_rgba(251,191,36,1)] active:translate-y-1 active:shadow-none' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      领取奖励
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
