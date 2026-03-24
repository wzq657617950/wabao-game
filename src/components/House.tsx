import React from 'react';
import { GameState } from '../types';
import { HOUSES } from '../gameLogic';
import { Home as HomeIcon, ArrowUpCircle, CheckCircle2, BookOpen, Trophy, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { soundManager } from '../sound';

interface HouseProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setActiveTab: (tab: string) => void;
}

const HOUSE_IMAGES: Record<number, string> = {
  0: '⛺', // Tent
  1: '🛖', // Wooden Hut
  2: '🏠', // Brick House
  3: '🏡', // Villa
  4: '🏰', // Castle
  5: '🏛️', // Mansion
  6: '🏯', // Palace
  7: '👑', // Royal Palace
  8: '☁️', // Sky Castle
  9: '🚀', // Space Station
  10: '🌌', // Galactic Empire
  11: '✨', // Cosmic Nexus
  12: '🌀', // Dimensional Rift
  13: '♾️'
};

export default function House({ state, setState, setActiveTab }: HouseProps) {
  const currentHouse = HOUSES[state.houseLevel] || HOUSES[0];
  const nextHouse = HOUSES[state.houseLevel + 1];

  const handleUpgrade = () => {
    if (!nextHouse) return;
    
    // Check requirements
    for (const [mat, amount] of Object.entries(nextHouse.req)) {
      if (mat === '黑宝石' || mat === '七彩宝石') {
        if ((state.inventory[mat as any] || 0) < amount) return;
      } else {
        if ((state.materials[mat as any] || 0) < amount) return;
      }
    }

    soundManager.playLevelUp();

    setState(prev => {
      if (!prev) return prev;
      const newMaterials = { ...prev.materials };
      const newInventory = { ...prev.inventory };
      
      for (const [mat, amount] of Object.entries(nextHouse.req)) {
        if (mat === '黑宝石' || mat === '七彩宝石') {
          newInventory[mat as any] -= amount;
        } else {
          newMaterials[mat as any] -= amount;
        }
      }

      return {
        ...prev,
        materials: newMaterials,
        inventory: newInventory,
        houseLevel: prev.houseLevel + 1,
        xp: prev.xp + 100, // 建造房屋 = 100xp
      };
    });
  };

  const canUpgrade = nextHouse && Object.entries(nextHouse.req).every(([mat, amount]) => {
    if (mat === '黑宝石' || mat === '七彩宝石') {
      return (state.inventory[mat as any] || 0) >= amount;
    }
    return (state.materials[mat as any] || 0) >= amount;
  });

  return (
    <div className="p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-2xl border-4 border-white shadow-sm">
          <HomeIcon className="text-indigo-500" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">房屋系统</h1>
          <p className="text-sm text-white/80 font-bold">升级房屋获取更多特权</p>
        </div>
      </div>

      {/* Museum, Achievements, and Backpack Shortcuts */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('backpack');
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <div className="p-3 bg-fuchsia-100 rounded-xl text-fuchsia-500">
            <Package size={24} />
          </div>
          <span className="font-bold text-sm">背包</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('museum');
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <div className="p-3 bg-rose-100 rounded-xl text-rose-500">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-sm">图鉴</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('achievements');
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <div className="p-3 bg-amber-100 rounded-xl text-amber-500">
            <Trophy size={24} />
          </div>
          <span className="font-bold text-sm">成就</span>
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('me');
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <div className="p-3 bg-sky-100 rounded-xl text-sky-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span className="font-bold text-sm">掠夺</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-white mb-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-32 h-32 bg-indigo-50 rounded-full border-4 border-indigo-100 flex items-center justify-center mb-4 shadow-inner overflow-hidden text-6xl drop-shadow-md">
            {state.customHouses?.[currentHouse.id] ? (
              <img src={state.customHouses[currentHouse.id]} alt={currentHouse.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              HOUSE_IMAGES[state.houseLevel] || '⛺'
            )}
          </div>
          <h2 className="text-xl font-black text-indigo-600 flex items-center gap-2 bg-indigo-100 px-4 py-1.5 rounded-full border-2 border-indigo-200">
            {currentHouse.name}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 flex flex-col items-center text-center shadow-sm">
            <div className="text-slate-500 font-bold mb-1">仓库容量</div>
            <div className="font-black text-slate-700 text-lg">{currentHouse.capacity}</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border-2 border-emerald-100 flex flex-col items-center text-center shadow-sm">
            <div className="text-emerald-600 font-bold mb-1">挖宝暴击率</div>
            <div className="font-black text-emerald-700 text-lg">+{currentHouse.critRate * 100}%</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border-2 border-amber-100 flex flex-col items-center text-center shadow-sm">
            <div className="text-amber-600 font-bold mb-1">金币收益加成</div>
            <div className="font-black text-amber-700 text-lg">{currentHouse.coinBoost}x</div>
          </div>
          <div className="bg-sky-50 p-3 rounded-2xl border-2 border-sky-100 flex flex-col items-center text-center shadow-sm">
            <div className="text-sky-600 font-bold mb-1">铲子产量</div>
            <div className="font-black text-sky-700 text-lg">{currentHouse.shovelsPerHour}/小时</div>
          </div>
          <div className="bg-fuchsia-50 p-3 rounded-2xl border-2 border-fuchsia-100 flex flex-col items-center text-center shadow-sm">
            <div className="text-fuchsia-600 font-bold mb-1">矿工槽位</div>
            <div className="font-black text-fuchsia-700 text-lg">{currentHouse.maxMiners}名</div>
          </div>
          <div className="bg-rose-50 p-3 rounded-2xl border-2 border-rose-100 flex flex-col items-center text-center shadow-sm">
            <div className="text-rose-600 font-bold mb-1">矿工效率加成</div>
            <div className="font-black text-rose-700 text-lg">+{currentHouse.minerSpeedBoost}%</div>
          </div>
        </div>
      </div>

      {nextHouse ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-white">
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
            升级到: <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{nextHouse.name}</span>
          </h2>
          
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-slate-500">所需材料:</h3>
            {Object.entries(nextHouse.req).map(([mat, amount]) => {
              const isGem = mat === '黑宝石' || mat === '七彩宝石';
              const currentAmount = isGem ? (state.inventory[mat as any] || 0) : (state.materials[mat as any] || 0);
              const isMet = currentAmount >= amount;
              
              return (
                <div key={mat} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <span className="text-xl">{isGem ? '💎' : '🧱'}</span> {mat}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black px-2 py-1 rounded-lg ${isMet ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {currentAmount} / {amount}
                    </span>
                    {isMet && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all border-4 border-white ${
              canUpgrade 
                ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle size={24} />
            升级房屋 (+100 XP)
          </button>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-white text-center">
          <div className="text-6xl mb-4 drop-shadow-md">👑</div>
          <h2 className="text-2xl font-black text-amber-500 mb-2">已达到最高等级</h2>
          <p className="text-slate-500 font-bold">你的房屋无比辉煌！</p>
        </div>
      )}
    </div>
  );
}
