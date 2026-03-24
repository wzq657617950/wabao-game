import React, { useState } from 'react';
import { GameState, UniqueGear, GearSlot, GearRarity } from '../types';
import { ArrowLeft, Shield, Sword, X, Zap, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../sound';
import { GEAR_DICTIONARY } from '../gameLogic';

interface EquipmentProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onBack: () => void;
}

const RARITY_COLORS: Record<GearRarity, string> = {
  'C': 'bg-slate-200 border-slate-400 text-slate-700',
  'B': 'bg-emerald-200 border-emerald-400 text-emerald-800',
  'A': 'bg-sky-200 border-sky-400 text-sky-800',
  'R': 'bg-fuchsia-200 border-fuchsia-400 text-fuchsia-800',
  'SR': 'bg-amber-200 border-amber-400 text-amber-800',
  'SSR': 'bg-red-200 border-red-500 text-red-800',
  'XR': 'bg-slate-800 border-indigo-500 text-indigo-200',
  'XXR': 'bg-black border-red-600 text-red-400',
  'MAX': 'bg-gradient-to-br from-yellow-300 via-red-500 to-purple-600 border-yellow-200 text-white',
};

const SLOT_NAMES: Record<GearSlot, string> = {
  weapon: '武器',
  helmet: '头盔',
  armor: '护甲',
  boots: '战靴',
  accessory: '饰品'
};

export default function Equipment({ state, setState, onBack }: EquipmentProps) {
  const [selectedGear, setSelectedGear] = useState<UniqueGear | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);

  const equipGear = (gear: UniqueGear) => {
    soundManager.playLevelUp();
    setState(prev => {
      if (!prev) return prev;
      
      const newEquipped = { ...prev.equippedGear };
      const newInventory = [...(prev.inventoryGear || [])];
      
      // If there's an item in the slot already, move it back to inventory
      if (newEquipped[gear.slot]) {
        newInventory.push(newEquipped[gear.slot] as UniqueGear);
      }
      
      // Equip the new gear
      newEquipped[gear.slot] = gear;
      
      // Remove from inventory
      const index = newInventory.findIndex(g => g.id === gear.id);
      if (index > -1) {
        newInventory.splice(index, 1);
      }

      return {
        ...prev,
        equippedGear: newEquipped,
        inventoryGear: newInventory
      };
    });
    setSelectedGear(null);
  };

  const handleMergeGear = () => {
    soundManager.playLevelUp();
    setState(prev => {
      if (!prev || !prev.inventoryGear) return prev;
      
      const rarities: GearRarity[] = ['C', 'B', 'A', 'R', 'SR', 'SSR', 'XR', 'XXR', 'MAX'];
      let newInventory = [...prev.inventoryGear];
      let hasMerged = false;

      // Group by rarity ONLY
      const grouped: Record<string, UniqueGear[]> = {};
      newInventory.forEach(gear => {
        const key = gear.rarity;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(gear);
      });

      const nextInventory: UniqueGear[] = [];

      Object.entries(grouped).forEach(([rarity, gears]) => {
        const rarityIndex = rarities.indexOf(rarity as GearRarity);
        
        if (rarityIndex < rarities.length - 1 && gears.length >= 10) {
          hasMerged = true;
          const numMerges = Math.floor(gears.length / 10);
          const remainder = gears.length % 10;
          
          // Keep remainder
          nextInventory.push(...gears.slice(0, remainder));
          
          // Generate new higher rarity gears
          const nextRarity = rarities[rarityIndex + 1];
          for (let i = 0; i < numMerges; i++) {
            // Randomly select one of the gear types used for merging as the template for the new gear
            const baseGearIndex = i * 10;
            const templateGear = gears[baseGearIndex];
            const template = { name: templateGear.name.split('· ')[1], icon: templateGear.icon! };
            const mergeSlot = templateGear.slot;

            const rarityMultipliers: Record<GearRarity, number> = {
              'C': 1, 'B': 2, 'A': 4, 'R': 8, 'SR': 16, 'SSR': 32, 'XR': 64, 'XXR': 128, 'MAX': 300
            };
            const mult = rarityMultipliers[nextRarity];
            const level = Math.max(1, Math.floor(Math.random() * 20));

            const mergedGear: UniqueGear = {
              id: `gear_merged_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              name: `${nextRarity} · ${template.name}`,
              icon: template.icon,
              slot: mergeSlot,
              rarity: nextRarity,
              level,
              power: 0,
              baseStats: {
                attack: Math.floor((mergeSlot === 'weapon' ? 10 : mergeSlot === 'accessory' ? 5 : 2) * mult * level),
                defense: Math.floor((mergeSlot === 'armor' ? 10 : mergeSlot === 'helmet' ? 8 : mergeSlot === 'boots' ? 6 : 2) * mult * level),
                hp: Math.floor((mergeSlot === 'armor' ? 50 : mergeSlot === 'helmet' ? 30 : mergeSlot === 'boots' ? 20 : 10) * mult * level),
              },
              subStats: {}
            };

            const numSubStats = nextRarity === 'MAX' ? 6 : nextRarity === 'XXR' ? 5 : nextRarity === 'XR' ? 4 : nextRarity === 'SSR' ? 3 : nextRarity === 'SR' ? 2 : nextRarity === 'R' ? 1 : 0;
            const possibleSubs = ['critRate', 'critDamage', 'dodgeRate', 'counterRate', 'vampRate', 'plunderBonus', 'digSpeed'];
            
            for (let j = 0; j < numSubStats; j++) {
              const sub = possibleSubs[Math.floor(Math.random() * possibleSubs.length)] as keyof UniqueGear['subStats'];
              mergedGear.subStats[sub] = (mergedGear.subStats[sub] || 0) + (Math.random() * 0.05 * mult * (sub === 'critDamage' ? 5 : 1));
            }

            mergedGear.power = Math.floor(
              (mergedGear.baseStats.attack * 2 + mergedGear.baseStats.defense * 1.5 + mergedGear.baseStats.hp * 0.2) * 
              (1 + (mergedGear.subStats.critRate || 0) * ((mergedGear.subStats.critDamage || 0) + 0.5)) * 
              (1 + (mergedGear.subStats.dodgeRate || 0) * 0.5) *
              (1 + (mergedGear.subStats.counterRate || 0) * 0.5) *
              (1 + (mergedGear.subStats.vampRate || 0) * 0.5)
            );

            nextInventory.push(mergedGear);
          }
        } else {
          nextInventory.push(...gears);
        }
      });

      if (!hasMerged) {
        alert("没有满足10件同品质的装备可以合成！");
        return prev;
      }

      return {
        ...prev,
        inventoryGear: nextInventory
      };
    });
  };

  const unequipGear = (slot: GearSlot) => {
    soundManager.playClick();
    setState(prev => {
      if (!prev) return prev;
      
      const newEquipped = { ...prev.equippedGear };
      const newInventory = [...(prev.inventoryGear || [])];
      const gearToUnequip = newEquipped[slot];
      
      if (gearToUnequip) {
        newInventory.push(gearToUnequip);
        delete newEquipped[slot];
      }
      
      return {
        ...prev,
        equippedGear: newEquipped,
        inventoryGear: newInventory
      };
    });
    setSelectedGear(null);
  };

  const renderGearSlot = (slot: GearSlot) => {
    const gear = state.equippedGear[slot];
    return (
      <div 
        onClick={() => {
          if (gear) {
            soundManager.playClick();
            setSelectedGear(gear);
          }
        }}
        className={`relative aspect-square rounded-2xl border-4 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-transform ${gear ? RARITY_COLORS[gear.rarity] + ' hover:scale-105 active:scale-95' : 'bg-white/50 border-dashed border-white/60 text-slate-400'}`}
      >
        {gear ? (
          <>
            <span className="text-3xl mb-1 drop-shadow-md">
              {gear.icon || (slot === 'weapon' ? '⚔️' : slot === 'helmet' ? '🪖' : slot === 'armor' ? '🛡️' : slot === 'boots' ? '👢' : '💍')}
            </span>
            <span className="text-[10px] font-black px-1 text-center leading-tight drop-shadow-sm">{gear.name}</span>
            <div className="absolute bottom-0 w-full bg-black/20 text-[10px] font-black text-center py-0.5 backdrop-blur-sm text-white">
              Lv.{gear.level}
            </div>
          </>
        ) : (
          <span className="font-bold text-sm">{SLOT_NAMES[slot]}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-900 p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform border border-white/20"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-white drop-shadow-md flex items-center gap-2">
          <Shield className="text-fuchsia-400" /> 装备管理
        </h1>
        <button 
          onClick={() => {
            soundManager.playClick();
            setShowGlossary(true);
          }}
          className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform border border-white/20 hover:bg-white/20"
        >
          <BookOpen size={20} />
        </button>
      </div>

      {/* Equipped Gear Grid */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-700 mb-6">
        <h2 className="text-white font-black mb-6 text-center text-lg drop-shadow-md">当前装备</h2>
        
        <div className="relative w-full max-w-[280px] mx-auto aspect-square mb-4">
          {/* Central Character/Avatar Placeholder */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-slate-900/50 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-inner z-0">
            <span className="text-6xl drop-shadow-lg opacity-80">👤</span>
          </div>

          {/* Top: Helmet */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 z-10">
            {renderGearSlot('helmet')}
          </div>
          
          {/* Left: Weapon */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-20 z-10">
            {renderGearSlot('weapon')}
          </div>
          
          {/* Right: Armor (Shield) */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-20 h-20 z-10">
            {renderGearSlot('armor')}
          </div>
          
          {/* Bottom Left: Boots */}
          <div className="absolute bottom-4 left-8 w-16 h-16 z-10">
            {renderGearSlot('boots')}
          </div>
          
          {/* Bottom Right: Accessory */}
          <div className="absolute bottom-4 right-8 w-16 h-16 z-10">
            {renderGearSlot('accessory')}
          </div>
        </div>
      </div>

      {/* Inventory Gear */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black">背包中的装备</h2>
          <span className="text-sm font-normal text-slate-400">{(state.inventoryGear || []).length} 件</span>
        </div>
        
        <div className="bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-700/50 flex justify-between items-center">
          <span className="text-xs text-slate-400">任意10件同品质的装备自动合成高一品质装备</span>
          <button 
            onClick={() => handleMergeGear()}
            className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-black shadow-lg transition-colors active:scale-95"
          >
            一键合成
          </button>
        </div>
        
        {(state.inventoryGear || []).length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-bold">
            暂无装备，去矿洞里挖宝获取吧！
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {[...state.inventoryGear].sort((a, b) => b.power - a.power).map((gear) => (
              <div 
                key={gear.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedGear(gear);
                }}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${RARITY_COLORS[gear.rarity]}`}
              >
                <span className="text-2xl mb-1 drop-shadow-sm">
                  {gear.icon || (gear.slot === 'weapon' ? '⚔️' : gear.slot === 'helmet' ? '🪖' : gear.slot === 'armor' ? '🛡️' : gear.slot === 'boots' ? '👢' : '💍')}
                </span>
                <span className="text-[10px] font-black px-1 text-center truncate w-full drop-shadow-sm">{gear.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gear Details Modal */}
      <AnimatePresence>
        {selectedGear && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedGear(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl flex flex-col md:flex-row gap-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Currently Equipped Gear (for comparison) */}
              {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                <div className={`flex-1 rounded-3xl p-6 shadow-2xl border-4 opacity-90 scale-95 ${RARITY_COLORS[state.equippedGear[selectedGear.slot]!.rarity]}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-black bg-black/20 px-2 py-1 rounded-md mb-1 inline-block">当前装备</div>
                      <h3 className="text-xl font-black drop-shadow-sm">{state.equippedGear[selectedGear.slot]!.name}</h3>
                      <div className="text-xs font-bold opacity-80 mt-1">
                        {state.equippedGear[selectedGear.slot]!.rarity} | Lv.{state.equippedGear[selectedGear.slot]!.level} | {SLOT_NAMES[selectedGear.slot]}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/40 rounded-2xl p-4 mb-4 backdrop-blur-md border border-white/30">
                    <div className="flex items-center gap-2 text-lg font-black mb-3 pb-2 border-b border-white/30">
                      <Zap size={18} /> 战力: {state.equippedGear[selectedGear.slot]!.power.toLocaleString()}
                    </div>
                    
                    <div className="space-y-1.5 font-bold text-xs">
                      {state.equippedGear[selectedGear.slot]!.baseStats.attack > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1"><Sword size={14}/> 攻击力</span>
                          <span>+{state.equippedGear[selectedGear.slot]!.baseStats.attack}</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.baseStats.defense > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1"><Shield size={14}/> 防御力</span>
                          <span>+{state.equippedGear[selectedGear.slot]!.baseStats.defense}</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.baseStats.hp > 0 && (
                        <div className="flex justify-between text-green-800">
                          <span className="flex items-center gap-1">❤️ 生命值</span>
                          <span>+{state.equippedGear[selectedGear.slot]!.baseStats.hp}</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.critRate && (
                        <div className="flex justify-between text-amber-700">
                          <span>暴击率</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.critRate! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.critDamage && (
                        <div className="flex justify-between text-orange-700">
                          <span>暴击伤害</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.critDamage! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.dodgeRate && (
                        <div className="flex justify-between text-emerald-700">
                          <span>闪避率</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.dodgeRate! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.counterRate && (
                        <div className="flex justify-between text-indigo-700">
                          <span>反击率</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.counterRate! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.vampRate && (
                        <div className="flex justify-between text-red-700">
                          <span>吸血率</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.vampRate! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.plunderBonus && (
                        <div className="flex justify-between text-rose-700">
                          <span>掠夺加成</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.plunderBonus! * 100)}%</span>
                        </div>
                      )}
                      {state.equippedGear[selectedGear.slot]!.subStats.digSpeed && (
                        <div className="flex justify-between text-sky-700">
                          <span>挖掘速度</span>
                          <span>+{Math.floor(state.equippedGear[selectedGear.slot]!.subStats.digSpeed! * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Gear */}
              <div className={`flex-1 rounded-3xl p-6 shadow-2xl border-4 relative ${RARITY_COLORS[selectedGear.rarity]}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                      <div className="text-xs font-black bg-white/40 px-2 py-1 rounded-md mb-1 inline-block text-slate-800">目标装备</div>
                    )}
                    <h3 className="text-2xl font-black drop-shadow-sm">{selectedGear.name}</h3>
                    <div className="text-sm font-bold opacity-80 mt-1">
                      {selectedGear.rarity} | Lv.{selectedGear.level} | {SLOT_NAMES[selectedGear.slot]}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedGear(null)}
                    className="p-1 bg-black/10 rounded-full hover:bg-black/20 absolute top-4 right-4"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-white/40 rounded-2xl p-4 mb-4 backdrop-blur-md border border-white/30">
                  <div className="flex items-center gap-2 text-xl font-black mb-3 pb-2 border-b border-white/30">
                    <Zap size={20} /> 战力: {selectedGear.power.toLocaleString()}
                    {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                      <span className={`text-sm ${selectedGear.power > state.equippedGear[selectedGear.slot]!.power ? 'text-green-600' : 'text-red-600'}`}>
                        ({selectedGear.power > state.equippedGear[selectedGear.slot]!.power ? '+' : ''}{selectedGear.power - state.equippedGear[selectedGear.slot]!.power})
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 font-bold text-sm">
                    {selectedGear.baseStats.attack > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Sword size={16}/> 攻击力</span>
                        <div className="flex items-center gap-1">
                          <span>+{selectedGear.baseStats.attack}</span>
                          {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                            <span className={`text-xs ${selectedGear.baseStats.attack > state.equippedGear[selectedGear.slot]!.baseStats.attack ? 'text-green-600' : 'text-red-600'}`}>
                              ({selectedGear.baseStats.attack > state.equippedGear[selectedGear.slot]!.baseStats.attack ? '+' : ''}{selectedGear.baseStats.attack - state.equippedGear[selectedGear.slot]!.baseStats.attack})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedGear.baseStats.defense > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Shield size={16}/> 防御力</span>
                        <div className="flex items-center gap-1">
                          <span>+{selectedGear.baseStats.defense}</span>
                          {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                            <span className={`text-xs ${selectedGear.baseStats.defense > state.equippedGear[selectedGear.slot]!.baseStats.defense ? 'text-green-600' : 'text-red-600'}`}>
                              ({selectedGear.baseStats.defense > state.equippedGear[selectedGear.slot]!.baseStats.defense ? '+' : ''}{selectedGear.baseStats.defense - state.equippedGear[selectedGear.slot]!.baseStats.defense})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedGear.baseStats.hp > 0 && (
                      <div className="flex justify-between text-green-800">
                        <span className="flex items-center gap-1">❤️ 生命值</span>
                        <div className="flex items-center gap-1">
                          <span>+{selectedGear.baseStats.hp}</span>
                          {state.equippedGear[selectedGear.slot] && state.equippedGear[selectedGear.slot]?.id !== selectedGear.id && (
                            <span className={`text-xs ${selectedGear.baseStats.hp > state.equippedGear[selectedGear.slot]!.baseStats.hp ? 'text-green-600' : 'text-red-600'}`}>
                              ({selectedGear.baseStats.hp > state.equippedGear[selectedGear.slot]!.baseStats.hp ? '+' : ''}{selectedGear.baseStats.hp - state.equippedGear[selectedGear.slot]!.baseStats.hp})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedGear.subStats.critRate && (
                      <div className="flex justify-between text-amber-700">
                        <span>暴击率</span>
                        <span>+{Math.floor(selectedGear.subStats.critRate * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.critDamage && (
                      <div className="flex justify-between text-orange-700">
                        <span>暴击伤害</span>
                        <span>+{Math.floor(selectedGear.subStats.critDamage * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.dodgeRate && (
                      <div className="flex justify-between text-emerald-700">
                        <span>闪避率</span>
                        <span>+{Math.floor(selectedGear.subStats.dodgeRate * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.counterRate && (
                      <div className="flex justify-between text-indigo-700">
                        <span>反击率</span>
                        <span>+{Math.floor(selectedGear.subStats.counterRate * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.vampRate && (
                      <div className="flex justify-between text-red-700">
                        <span>吸血率</span>
                        <span>+{Math.floor(selectedGear.subStats.vampRate * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.plunderBonus && (
                      <div className="flex justify-between text-rose-700">
                        <span>掠夺加成</span>
                        <span>+{Math.floor(selectedGear.subStats.plunderBonus * 100)}%</span>
                      </div>
                    )}
                    {selectedGear.subStats.digSpeed && (
                      <div className="flex justify-between text-sky-700">
                        <span>挖掘速度</span>
                        <span>+{Math.floor(selectedGear.subStats.digSpeed * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {state.equippedGear[selectedGear.slot]?.id === selectedGear.id ? (
                  <button
                    onClick={() => unequipGear(selectedGear.slot)}
                    className="w-full py-3 bg-black/20 hover:bg-black/30 rounded-xl font-black transition-colors"
                  >
                    卸下装备
                  </button>
                ) : (
                  <button
                    onClick={() => equipGear(selectedGear)}
                    className="w-full py-3 bg-white/80 hover:bg-white text-slate-800 rounded-xl font-black transition-colors shadow-sm"
                  >
                    {state.equippedGear[selectedGear.slot] ? '替换装备' : '装备'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glossary Modal */}
      <AnimatePresence>
        {showGlossary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => {
                  soundManager.playClick();
                  setShowGlossary(false);
                }}
                className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform border border-white/20"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="text-sky-400" /> 装备图鉴
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700">
                <h3 className="text-white font-black mb-3 border-b border-slate-700 pb-2">品质等级 (稀有度)</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(RARITY_COLORS).map(([rarity, colorClass]) => (
                    <div key={rarity} className={`px-3 py-1 rounded-lg text-xs font-black border-2 ${colorClass}`}>
                      {rarity}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3 font-bold">
                  * 矿洞等级越高，获得高品质装备的概率越大。MAX品质拥有最多6条随机副属性！
                </p>
              </div>

              {Object.entries(GEAR_DICTIONARY).map(([slot, items]) => (
                <div key={slot} className="bg-slate-800 rounded-3xl p-4 border border-slate-700">
                  <h3 className="text-white font-black mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                    {slot === 'weapon' ? '⚔️ 武器' : slot === 'helmet' ? '🪖 头盔' : slot === 'armor' ? '🛡️ 护甲' : slot === 'boots' ? '👢 战靴' : '💍 饰品'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-700/50">
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-[10px] text-slate-300 font-bold text-center">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
