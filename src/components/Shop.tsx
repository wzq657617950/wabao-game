import React from 'react';
import { GameState, BuffType, ShovelType, GemType } from '../types';
import { motion } from 'motion/react';
import { Store, Zap, Palette, Coins, Pickaxe } from 'lucide-react';
import { CHARACTERS, SHOVELS } from '../gameLogic';
import { soundManager } from '../sound';

interface ShopProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export default function Shop({ state, setState }: ShopProps) {
  const buySkin = (skinId: string, cost: number) => {
    if (state.coins >= cost && !state.unlockedSkins.includes(skinId)) {
      soundManager.playCoin();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coins: prev.coins - cost,
          unlockedSkins: [...prev.unlockedSkins, skinId],
          equippedSkin: skinId
        };
      });
    }
  };

  const equipSkin = (skinId: string) => {
    if (state.unlockedSkins.includes(skinId)) {
      soundManager.playClick();
      setState(prev => {
        if (!prev) return prev;
        return { ...prev, equippedSkin: skinId };
      });
    }
  };

  const exchangeShovel = (shovelId: ShovelType, fragmentId: GemType, cost: number) => {
    if (state.inventory[fragmentId] >= cost) {
      soundManager.playCoin();
      setState(prev => {
        if (!prev) return prev;
        
        const shovelDef = SHOVELS.find(s => s.id === shovelId);
        const addedDurability = shovelDef?.durability || 0;
        const currentDurability = (prev.shovelDurability || {})[shovelId] || 0;
        
        return {
          ...prev,
          inventory: {
            ...prev.inventory,
            [fragmentId]: prev.inventory[fragmentId] - cost
          },
          unlockedShovels: prev.unlockedShovels.includes(shovelId) ? prev.unlockedShovels : [...prev.unlockedShovels, shovelId],
          equippedShovel: shovelId,
          shovelDurability: {
            ...prev.shovelDurability,
            [shovelId]: currentDurability + addedDurability
          }
        };
      });
    }
  };

  const equipShovel = (shovelId: ShovelType) => {
    if (state.unlockedShovels.includes(shovelId)) {
      soundManager.playClick();
      setState(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          equippedShovel: shovelId,
          questsProgress: {
            ...prev.questsProgress,
            'q7': (prev.questsProgress['q7'] || 0) + 1
          }
        };
      });
    }
  };

  const buyBuff = (type: BuffType, cost: number, durationMins: number) => {
    if (state.coins >= cost) {
      soundManager.playCoin();
      setState(prev => {
        if (!prev) return prev;
        const now = Date.now();
        const durationMs = durationMins * 60 * 1000;
        
        // Check if buff already exists
        const existingBuffIndex = prev.activeBuffs.findIndex(b => b.type === type);
        let newBuffs = [...prev.activeBuffs];
        
        if (existingBuffIndex >= 0) {
          // Extend duration if already active
          const currentExpiry = Math.max(now, newBuffs[existingBuffIndex].expiresAt);
          newBuffs[existingBuffIndex] = {
            ...newBuffs[existingBuffIndex],
            expiresAt: currentExpiry + durationMs
          };
        } else {
          // Add new buff
          newBuffs.push({ type, expiresAt: now + durationMs });
        }

        return {
          ...prev,
          coins: prev.coins - cost,
          activeBuffs: newBuffs,
          questsProgress: {
            ...prev.questsProgress,
            'q6': (prev.questsProgress['q6'] || 0) + 1
          }
        };
      });
    }
  };

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
          <Store className="text-amber-400" /> 商店
        </h1>
        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border-2 border-white font-black text-amber-500 flex items-center gap-1">
          <Coins size={16} /> {state.coins}
        </div>
      </div>

      {/* Shovels Section */}
      <section className="mb-8">
        <h2 className="text-sm font-black text-white/90 drop-shadow-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Pickaxe size={18} className="text-amber-300" /> 铲子兑换 (碎片)
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {SHOVELS.filter(s => s.fragment).map(shovel => (
            <ShovelCard 
              key={shovel.id}
              shovel={shovel}
              state={state}
              onExchange={() => exchangeShovel(shovel.id as ShovelType, shovel.fragment!, shovel.cost)}
              onEquip={() => equipShovel(shovel.id as ShovelType)}
            />
          ))}
        </div>
      </section>

      {/* Skins Section */}
      <section className="mb-8">
        <h2 className="text-sm font-black text-white/90 drop-shadow-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette size={18} className="text-fuchsia-300" /> 外观道具
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {CHARACTERS.map(char => (
            <SkinCard 
              key={char.id}
              id={char.id} 
              name={char.name} 
              emoji={char.emoji} 
              cost={char.cost} 
              state={state} 
              onBuy={() => buySkin(char.id, char.cost)} 
              onEquip={() => equipSkin(char.id)} 
            />
          ))}
        </div>
      </section>

      {/* Buffs Section */}
      <section>
        <h2 className="text-sm font-black text-white/90 drop-shadow-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-300" /> 限时增益
        </h2>
        <div className="space-y-4">
          <BuffCard 
            title="金币狂热" 
            desc="未来 10 分钟内，挖宝金币收益增加 20%" 
            cost={1000} 
            onBuy={() => buyBuff('coin_boost', 1000, 10)} 
            canAfford={state.coins >= 1000}
          />
          <BuffCard 
            title="欧皇附体" 
            desc="未来 10 分钟内，所有宝石爆率翻倍" 
            cost={5000} 
            onBuy={() => buyBuff('gem_boost', 5000, 10)} 
            canAfford={state.coins >= 5000}
          />
        </div>
      </section>
    </div>
  );
}

function ShovelCard({ shovel, state, onExchange, onEquip }: any) {
  const isUnlocked = state.unlockedShovels.includes(shovel.id);
  const isEquipped = state.equippedShovel === shovel.id;
  const fragmentCount = state.inventory[shovel.fragment] || 0;
  const canAfford = fragmentCount >= shovel.cost;

  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-4 border-4 flex items-center justify-between transition-all shadow-sm ${isEquipped ? 'border-emerald-400 bg-emerald-50/80' : 'border-white'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 shadow-inner ${isEquipped ? 'bg-emerald-100 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
          <Pickaxe size={28} className={shovel.color} />
        </div>
        <div>
          <div className="font-black text-slate-700 text-lg">{shovel.name}</div>
          <div className="text-xs font-bold text-amber-500">金币收益 x{shovel.multiplier}</div>
        </div>
      </div>
      
      {isEquipped ? (
        <div className="flex flex-col gap-1">
          <button disabled className="px-5 py-2.5 bg-emerald-100 text-emerald-600 border-2 border-emerald-200 rounded-2xl font-black text-sm shadow-sm">
            使用中
          </button>
          {shovel.durability && (
            <div className="text-[10px] text-center font-bold text-emerald-600">
              耐久: {(state.shovelDurability || {})[shovel.id] || 0}
            </div>
          )}
        </div>
      ) : isUnlocked ? (
        <div className="flex flex-col gap-1">
          <button onClick={onEquip} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 rounded-2xl font-black text-sm transition-all active:translate-y-1 shadow-sm">
            装备
          </button>
          {shovel.durability && (
            <div className="text-[10px] text-center font-bold text-slate-500">
              耐久: {(state.shovelDurability || {})[shovel.id] || 0}
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={onExchange} 
          disabled={!canAfford}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-1 transition-all border-4 border-white shadow-sm ${
            canAfford ? 'bg-indigo-500 hover:bg-indigo-400 text-white active:translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          💎 {fragmentCount}/{shovel.cost}
        </button>
      )}
    </div>
  );
}

function SkinCard({ id, name, emoji, cost, state, onBuy, onEquip }: any) {
  const isUnlocked = state.unlockedSkins.includes(id);
  const isEquipped = state.equippedSkin === id;
  const canAfford = state.coins >= cost;

  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-4 border-4 transition-all shadow-sm flex flex-col items-center ${isEquipped ? 'border-emerald-400 bg-emerald-50/80' : 'border-white'}`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-inner mb-3 overflow-hidden ${isEquipped ? 'bg-emerald-100 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
        {state.customSkins?.[id] ? (
          <img src={state.customSkins[id]} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-4xl drop-shadow-md">{emoji}</span>
        )}
      </div>
      <div className="text-center font-black text-slate-700 mb-4">{name}</div>
      
      {isEquipped ? (
        <button disabled className="w-full py-3 bg-emerald-100 text-emerald-600 border-2 border-emerald-200 rounded-2xl font-black text-sm shadow-sm">
          使用中
        </button>
      ) : isUnlocked ? (
        <button onClick={onEquip} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 rounded-2xl font-black text-sm transition-all active:translate-y-1 shadow-sm">
          装备
        </button>
      ) : (
        <button 
          onClick={onBuy} 
          disabled={!canAfford}
          className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-1 transition-all border-4 border-white shadow-sm ${
            canAfford ? 'bg-amber-400 hover:bg-amber-300 text-white active:translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Coins size={16} /> {cost}
        </button>
      )}
    </div>
  );
}

function BuffCard({ title, desc, cost, onBuy, canAfford }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border-4 border-white shadow-sm flex justify-between items-center">
      <div>
        <div className="font-black text-slate-700 text-lg">{title}</div>
        <div className="text-xs font-bold text-slate-500 mt-1 max-w-[200px]">{desc}</div>
      </div>
      <button 
        onClick={onBuy}
        disabled={!canAfford}
        className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-1 transition-all whitespace-nowrap border-4 border-white shadow-sm ${
          canAfford ? 'bg-indigo-500 hover:bg-indigo-400 text-white active:translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Coins size={16} /> {cost}
      </button>
    </div>
  );
}
