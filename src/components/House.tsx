import React from 'react';
import { GameState } from '../types';
import { HOUSES, getHouseRequirementMultiplier } from '../gameLogic';
import { Home as HomeIcon, ArrowUpCircle, CheckCircle2, BookOpen, Trophy, Package, LayoutGrid, X } from 'lucide-react';
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
  const [showHouseGallery, setShowHouseGallery] = React.useState(false);
  const currentHouse = HOUSES[state.houseLevel] || HOUSES[0];
  const nextHouse = HOUSES[state.houseLevel + 1];
  const nextHouseReqMultiplier = nextHouse ? getHouseRequirementMultiplier(nextHouse.id) : 1;
  const adjustedNextHouseReq = nextHouse
    ? Object.fromEntries(
        Object.entries(nextHouse.req).map(([mat, amount]) => [mat, Math.ceil(amount * nextHouseReqMultiplier)])
      )
    : {};

  const handleUpgrade = () => {
    if (!nextHouse) return;
    
    // Check requirements
    for (const [mat, amount] of Object.entries(adjustedNextHouseReq)) {
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
      
      for (const [mat, amount] of Object.entries(adjustedNextHouseReq)) {
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

  const canUpgrade = nextHouse && Object.entries(adjustedNextHouseReq).every(([mat, amount]) => {
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
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">房屋系统</h1>
          <p className="text-sm text-white/80 font-bold">升级房屋获取更多特权</p>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            setShowHouseGallery(true);
          }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border-4 border-white flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95"
        >
          <LayoutGrid className="text-indigo-500" size={20} />
          <span className="font-black text-slate-700 text-xs">房屋图鉴</span>
        </button>
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
          {nextHouseReqMultiplier > 1 && (
            <div className="mb-3 text-xs font-black text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
              中后期建造难度系数：x{nextHouseReqMultiplier.toFixed(2)}
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-slate-500">所需材料:</h3>
            {Object.entries(adjustedNextHouseReq).map(([mat, amount]) => {
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

      {showHouseGallery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white rounded-3xl border-4 border-white shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b-2 border-slate-100">
              <h2 className="text-xl font-black text-slate-800">房屋等级展示</h2>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowHouseGallery(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-3">
              {HOUSES.map((house) => {
                const isCurrent = house.id === state.houseLevel;
                const isUnlocked = house.id <= state.houseLevel;
                return (
                  <div
                    key={house.id}
                    className={`rounded-2xl border-2 p-4 ${isCurrent ? 'border-indigo-400 bg-indigo-50' : isUnlocked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{HOUSE_IMAGES[house.id] || '🏠'}</span>
                        <div className="font-black text-slate-800">Lv.{house.id} {house.name}</div>
                      </div>
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${isCurrent ? 'bg-indigo-200 text-indigo-700' : isUnlocked ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {isCurrent ? '当前' : isUnlocked ? '已解锁' : '未解锁'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-600">
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">容量 {house.capacity}</div>
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">暴击 +{house.critRate * 100}%</div>
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">金币 x{house.coinBoost}</div>
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">铲子 {house.shovelsPerHour}/h</div>
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">矿工 {house.maxMiners} 名</div>
                      <div className="bg-white rounded-xl px-2 py-1 border border-slate-200">效率 +{house.minerSpeedBoost}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
