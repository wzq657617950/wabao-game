import React, { useState } from 'react';
import { GameState, GemType, MaterialType } from '../types';
import { HOUSES, GEM_VALUES, MATERIAL_TYPES } from '../gameLogic';
import { Package, Gem, Box, ArrowRightCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../sound';

interface BackpackProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

const ITEM_DETAILS: Record<string, { icon: string, color: string, rarity: string, desc: string, value?: number }> = {
  '七彩宝石': { icon: '🌈', color: 'from-fuchsia-400 to-pink-500 text-white', rarity: '神话', desc: '散发着七彩光芒的究极宝石，极其罕见。', value: 5000 },
  '蓝宝石': { icon: '🔵', color: 'from-blue-400 to-indigo-500 text-white', rarity: '传说', desc: '深邃如海的蓝宝石，价值连城。', value: 1000 },
  '红宝石': { icon: '🔴', color: 'from-red-400 to-rose-500 text-white', rarity: '史诗', desc: '炽热如火的红宝石，非常珍贵。', value: 200 },
  '绿宝石': { icon: '🟢', color: 'from-emerald-400 to-teal-500 text-white', rarity: '稀有', desc: '充满生机的绿宝石，比较少见。', value: 100 },
  '白宝石': { icon: '⚪', color: 'from-slate-100 to-slate-300 text-slate-700', rarity: '优秀', desc: '纯洁无瑕的白宝石，有一定价值。', value: 10 },
  '黑宝石': { icon: '🌑', color: 'from-slate-700 to-slate-900 text-white', rarity: '普通', desc: '随处可见的黑宝石，常用于基础建设。', value: 2 },
  '木材': { icon: '🪵', color: 'from-amber-600 to-amber-800 text-white', rarity: '普通', desc: '基础建筑材料，用于建造早期房屋。' },
  '砖块': { icon: '🧱', color: 'from-orange-500 to-red-600 text-white', rarity: '普通', desc: '坚固的建筑材料，用于加固房屋。' },
  '水泥': { icon: '🪨', color: 'from-stone-400 to-stone-600 text-white', rarity: '优秀', desc: '现代建筑材料，用于建造高级房屋。' },
  '玻璃': { icon: '🪟', color: 'from-sky-200 to-sky-400 text-slate-800', rarity: '稀有', desc: '透明的建筑材料，用于建造豪华房屋。' },
  '钢材': { icon: '🏗️', color: 'from-slate-400 to-slate-600 text-white', rarity: '史诗', desc: '极其坚固的建筑材料，用于建造顶级建筑。' },
};

export default function Backpack({ state, setState }: BackpackProps) {
  const house = HOUSES[state.houseLevel] || HOUSES[0];
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const currentGemsCount = Object.entries(state.inventory).reduce((sum, [k, v]) => {
    if (k.includes('碎片')) return sum;
    return sum + (v as number);
  }, 0);

  const isWarehouseFull = currentGemsCount >= house.capacity;

  const calculateRewards = () => {
    let totalValue = 0;
    Object.entries(state.inventory).forEach(([k, v]) => {
      if (!k.includes('碎片')) {
        const value = ITEM_DETAILS[k]?.value || 0;
        totalValue += value * (v as number);
      }
    });

    // 优化奖励算法：移除了过高的1.5倍加成，金币现在按照1:1兑换，铲子和经验采用平滑曲线（平方根）避免后期数值爆炸
    const rewardCoins = Math.floor(totalValue); // Changed from totalValue * 1.5
    const rewardShovels = Math.max(10, Math.floor(currentGemsCount * 0.5) + Math.floor(Math.sqrt(totalValue) * 0.5));
    const rewardXp = Math.max(50, Math.floor(currentGemsCount * 2) + Math.floor(Math.sqrt(totalValue) * 2));

    return { rewardCoins, rewardShovels, rewardXp };
  };

  const { rewardCoins, rewardShovels, rewardXp } = calculateRewards();

  const handleExchangeChest = () => {
    if (!isWarehouseFull) return;

    soundManager.playCoin();
    setState(prev => {
      if (!prev) return prev;
      
      // Clear all gems
      const newInventory = { ...prev.inventory };
      Object.keys(newInventory).forEach(k => {
        if (!k.includes('碎片')) {
          newInventory[k as GemType] = 0;
        }
      });

      return {
        ...prev,
        inventory: newInventory,
        coins: prev.coins + rewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        shovels: prev.shovels + rewardShovels,
        xp: prev.xp + rewardXp,
        questsProgress: {
          ...prev.questsProgress,
          'q5': (prev.questsProgress['q5'] || 0) + 1
        }
      };
    });
  };

  const handleSellGem = (gemName: GemType) => {
    const amount = state.inventory[gemName] || 0;
    if (amount <= 0) return;

    const value = ITEM_DETAILS[gemName]?.value || 0;
    if (value <= 0) return;

    soundManager.playCoin();
    setState(prev => {
      if (!prev) return prev;
      
      const newInventory = { ...prev.inventory };
      newInventory[gemName] = Math.max(0, newInventory[gemName] - 1);

      // 优化单颗宝石兑换，同样给予一定的铲子和经验奖励
      const rewardShovels = Math.max(1, Math.floor(Math.sqrt(value) * 0.1));
      const rewardXp = Math.max(2, Math.floor(Math.sqrt(value) * 0.5));

      return {
        ...prev,
        inventory: newInventory,
        coins: prev.coins + value,
        shovels: prev.shovels + rewardShovels,
        xp: prev.xp + rewardXp,
        totalCoinsEarned: prev.totalCoinsEarned + value,
        questsProgress: {
          ...prev.questsProgress,
          'q5': (prev.questsProgress['q5'] || 0) + 1
        }
      };
    });
  };

  const renderItemCard = (name: string, count: number, isGem: boolean) => {
    const details = ITEM_DETAILS[name] || { icon: '📦', color: 'from-slate-200 to-slate-300 text-slate-700', rarity: '未知', desc: '未知物品' };
    const isHovered = hoveredItem === name;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        onHoverStart={() => setHoveredItem(name)}
        onHoverEnd={() => setHoveredItem(null)}
        key={name}
        className="relative group"
      >
        <div className={`bg-gradient-to-br ${details.color} p-4 rounded-2xl border-2 border-white/20 shadow-lg flex flex-col items-center justify-center text-center h-full min-h-[100px] transition-shadow duration-300 ${isHovered ? 'shadow-xl' : ''}`}>
          {state.customGems?.[name] ? (
            <div className="w-12 h-12 mb-2 rounded-xl overflow-hidden shadow-md">
              <img src={state.customGems[name]} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-4xl mb-2 drop-shadow-md">{details.icon}</span>
          )}
          <span className="text-xs font-bold opacity-90 mb-1">{name}</span>
          <motion.span 
            key={count}
            initial={{ scale: 1.5, y: -5 }}
            animate={{ scale: 1, y: 0 }}
            className="font-black text-xl drop-shadow-sm mb-2"
          >
            {count}
          </motion.span>
          {isGem && count > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSellGem(name as GemType);
              }}
              className="mt-auto px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-bold transition-colors border border-white/30 w-full"
            >
              兑换 (💰{details.value})
            </button>
          )}
        </div>

        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-800 text-white p-3 rounded-xl shadow-2xl z-50 pointer-events-none border border-slate-700"
          >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  details.rarity === '神话' ? 'bg-fuchsia-500/20 text-fuchsia-300' :
                  details.rarity === '传说' ? 'bg-blue-500/20 text-blue-300' :
                  details.rarity === '史诗' ? 'bg-red-500/20 text-red-300' :
                  details.rarity === '稀有' ? 'bg-emerald-500/20 text-emerald-300' :
                  details.rarity === '优秀' ? 'bg-slate-500/20 text-slate-300' :
                  'bg-slate-700 text-slate-400'
                }`}>{details.rarity}</span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">{details.desc}</p>
              {details.value && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md w-fit">
                  <span className="text-amber-500">💰</span> 价值: {details.value}
                </div>
              )}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
            </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-100 rounded-2xl border-4 border-white shadow-sm">
          <Package className="text-fuchsia-500" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">背包系统</h1>
          <p className="text-sm text-white/80 font-bold">查看你的战利品</p>
        </div>
      </div>

      {/* Warehouse Status */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
            <Gem size={20} className="text-fuchsia-500" /> 宝石仓库
          </h2>
          <span className={`text-sm font-black px-3 py-1 rounded-full border-2 ${isWarehouseFull ? 'bg-red-100 text-red-500 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {currentGemsCount} / {house.capacity}
          </span>
        </div>
        
        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden mb-4 border-2 border-slate-300/50">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isWarehouseFull ? 'bg-red-400' : 'bg-fuchsia-400'}`}
            style={{ width: `${Math.min(100, (currentGemsCount / house.capacity) * 100)}%` }}
          />
        </div>

        {isWarehouseFull && (
          <button
            onClick={handleExchangeChest}
            className="w-full py-4 rounded-2xl font-black text-sm bg-amber-400 hover:bg-amber-300 text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 mb-6 border-4 border-white active:translate-y-1 active:shadow-none"
          >
            <Box size={20} /> 一键出售所有宝石 ({rewardCoins}金币, {rewardShovels}铲子, {rewardXp}XP)
          </button>
        )}

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(state.inventory)
            .filter(([k]) => !k.includes('碎片'))
            .sort((a, b) => (ITEM_DETAILS[b[0]]?.value || 0) - (ITEM_DETAILS[a[0]]?.value || 0))
            .map(([gem, count]) => renderItemCard(gem, count as number, true))}
        </div>
      </div>

      {/* Materials */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-white">
        <h2 className="text-lg font-black text-slate-700 flex items-center gap-2 mb-4">
          <Box size={20} className="text-amber-500" /> 建筑材料
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {MATERIAL_TYPES.map(mat => renderItemCard(mat, state.materials[mat] || 0, false))}
        </div>
      </div>
    </div>
  );
}
