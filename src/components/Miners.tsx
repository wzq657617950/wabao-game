import React from 'react';
import { GameState } from '../types';
import { MINER_TIERS, MINER_SKILLS, HOUSES, getEffectiveMinerDigsPerMinute, getMinerUpgradeCostMultiplier } from '../gameLogic';
import { Users, ArrowUpCircle, Coins, Pickaxe, Zap, Star, Gem, ChevronsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../sound';

interface MinersProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export default function Miners({ state, setState }: MinersProps) {
  const [showUpgradeAnim, setShowUpgradeAnim] = React.useState<{ oldTier: any, newTier: any } | null>(null);

  const currentTier = MINER_TIERS.find(t => t.level === state.minerLevel) || MINER_TIERS[0];
  const nextTier = MINER_TIERS.find(t => t.level === state.minerLevel + 1);
  const currentHouse = HOUSES[state.houseLevel] || HOUSES[0];
  const maxMiners = currentHouse.maxMiners || 1;
  const houseSpeedBoost = currentHouse.minerSpeedBoost || 0;
  
  const costReductionLevel = state.minerSkills?.['cost_reduction'] || 0;
  const costReductionMultiplier = 1 - (costReductionLevel * 2) / 100;
  const hireCostMultiplier = state.houseLevel >= 11 ? 1.2 : state.houseLevel >= 9 ? 1.15 : state.houseLevel >= 7 ? 1.1 : state.houseLevel >= 5 ? 1.06 : 1;
  const upgradeCostMultiplier = getMinerUpgradeCostMultiplier(state.minerLevel + 1, state.houseLevel);

  const hireCost = Math.floor(2200 * Math.pow(state.minerCount + 1, 1.3) * hireCostMultiplier * costReductionMultiplier);
  const canHire = state.coins >= hireCost && state.minerCount < maxMiners;
  
  const upgradeCost = Math.floor((currentTier.upgradeCost || 0) * upgradeCostMultiplier * costReductionMultiplier);
  const canUpgrade = nextTier && state.coins >= upgradeCost;

  const speedSkillLevel = state.minerSkills?.['speed_boost'] || 0;
  const skillSpeedBoost = speedSkillLevel * 5;
  const totalSpeedBoost = houseSpeedBoost + skillSpeedBoost;

  const effectiveSingleMinerDigsPerMinute = getEffectiveMinerDigsPerMinute(state.minerLevel, currentTier.digsPerMinute || 1);
  const baseDigsPerMinute = state.minerCount * effectiveSingleMinerDigsPerMinute;
  const digsPerMinute = baseDigsPerMinute * (1 + totalSpeedBoost / 100);

  const handleHire = () => {
    if (canHire) {
      soundManager.playCoin();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coins: prev.coins - hireCost,
          minerCount: prev.minerCount + 1
        };
      });
    }
  };

  const handleUpgrade = () => {
    if (canUpgrade && nextTier) {
      soundManager.playLevelUp();
      setShowUpgradeAnim({ oldTier: currentTier, newTier: nextTier });
      setTimeout(() => {
        setShowUpgradeAnim(null);
      }, 2500);
      
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coins: prev.coins - upgradeCost,
          minerLevel: prev.minerLevel + 1
        };
      });
    }
  };

  const handleUpgradeSkill = (skillId: string) => {
    const skill = MINER_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    const currentLevel = state.minerSkills?.[skillId] || 0;
    if (currentLevel >= skill.maxLevel) return;

    const cost = Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, currentLevel));
    
    let canAfford = false;
    if (skill.costCurrency === 'coins') {
      canAfford = state.coins >= cost;
    } else if (skill.costCurrency === 'gem' && skill.gemType) {
      canAfford = (state.inventory[skill.gemType] || 0) >= cost;
    }

    if (canAfford) {
      soundManager.playLevelUp();
      setState(prev => {
        if (!prev) return prev;
        
        const newState = { ...prev, minerSkills: { ...prev.minerSkills } };
        newState.minerSkills[skillId] = currentLevel + 1;

        if (skill.costCurrency === 'coins') {
          newState.coins -= cost;
        } else if (skill.costCurrency === 'gem' && skill.gemType) {
          newState.inventory = { ...newState.inventory };
          newState.inventory[skill.gemType] -= cost;
        }

        return newState;
      });
    }
  };

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
          <Users className="text-sky-400" /> 矿工营地
        </h1>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border-4 border-white mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-700">当前矿工</h2>
            <p className="text-slate-500 font-bold flex items-center gap-1 mt-1">
              <Pickaxe size={16} /> 自动挖宝速度: <span className="text-sky-500">{Number(digsPerMinute.toFixed(1))} 次/分钟</span>
            </p>
          </div>
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-sky-200 shadow-inner">
            👷
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
            <div className="text-sm font-bold text-slate-400 mb-1">矿工数量</div>
            <div className="text-2xl font-black text-slate-700">{state.minerCount} <span className="text-sm text-slate-400">/ {maxMiners} 名</span></div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
            <div className="text-sm font-bold text-slate-400 mb-1">矿工等级</div>
            <div className="text-2xl font-black text-sky-600">{currentTier.name}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">每名矿工 {Number(effectiveSingleMinerDigsPerMinute.toFixed(2))} 次/分钟</div>
          </div>
        </div>
        
        {totalSpeedBoost > 0 && (
          <div className="mt-4 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border-2 border-rose-100">
            <Zap size={16} /> 效率加成: 矿工速度提升 {totalSpeedBoost}%
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {/* Hire Miner */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 border-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 border-2 border-emerald-200">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-700">雇佣新矿工</h3>
              <p className="text-sm font-bold text-slate-500">
                {state.minerCount >= maxMiners ? '已达到当前房屋矿工上限' : '增加1名矿工'}
              </p>
              {hireCostMultiplier > 1 && (
                <p className="text-[11px] font-black text-amber-600 mt-1">中后期雇佣系数 x{hireCostMultiplier.toFixed(2)}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleHire}
            disabled={!canHire}
            className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-1 ${
              canHire 
                ? 'bg-amber-400 hover:bg-amber-300 text-white shadow-[0_4px_0_rgba(251,191,36,1)] active:translate-y-1 active:shadow-none' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {state.minerCount >= maxMiners ? '已达上限' : <><Coins size={16} /> {hireCost}</>}
          </button>
        </div>

        {/* Upgrade Miner */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 border-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-500 border-2 border-purple-200">
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-700">升级矿工</h3>
              <p className="text-sm font-bold text-slate-500">
                {nextTier ? `升级为 ${nextTier.name}` : '已满级'}
              </p>
              {upgradeCostMultiplier > 1 && (
                <p className="text-[11px] font-black text-amber-600 mt-1">中后期升级系数 x{upgradeCostMultiplier.toFixed(2)}</p>
              )}
            </div>
          </div>
          {nextTier ? (
            <button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-1 ${
                canUpgrade 
                  ? 'bg-amber-400 hover:bg-amber-300 text-white shadow-[0_4px_0_rgba(251,191,36,1)] active:translate-y-1 active:shadow-none' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Coins size={16} /> {upgradeCost}
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-xl font-black text-sm bg-slate-100 text-slate-400">
              已满级
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Animation Modal */}
      <AnimatePresence>
        {showUpgradeAnim && (
          <motion.div
            key="upgrade-anim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-amber-200 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-transparent to-transparent opacity-50"></div>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -left-20 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl"
              />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-200 shadow-inner">
                  <ChevronsUp size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">升级成功!</h2>
                <p className="text-slate-500 font-bold mb-6">您的矿工变得更强了</p>
                
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <div className="text-xs font-bold text-slate-400 mb-1">原等级</div>
                    <div className="font-black text-slate-600">{showUpgradeAnim.oldTier.name}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{Number(getEffectiveMinerDigsPerMinute(showUpgradeAnim.oldTier.level, showUpgradeAnim.oldTier.digsPerMinute).toFixed(2))} 次/分</div>
                  </div>
                  <div className="text-amber-400 px-2">
                    <ArrowUpCircle size={24} />
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xs font-bold text-amber-500 mb-1">新等级</div>
                    <div className="font-black text-amber-600">{showUpgradeAnim.newTier.name}</div>
                    <div className="text-xs font-bold text-amber-500 mt-1">{Number(getEffectiveMinerDigsPerMinute(showUpgradeAnim.newTier.level, showUpgradeAnim.newTier.digsPerMinute).toFixed(2))} 次/分</div>
                  </div>
                </div>
                
                <div className="text-sm font-black text-emerald-500 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                  +{Number((getEffectiveMinerDigsPerMinute(showUpgradeAnim.newTier.level, showUpgradeAnim.newTier.digsPerMinute) - getEffectiveMinerDigsPerMinute(showUpgradeAnim.oldTier.level, showUpgradeAnim.oldTier.digsPerMinute)).toFixed(2))} 次/分钟 基础速度
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-100 rounded-2xl border-4 border-white shadow-sm">
          <Star className="text-fuchsia-500" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">矿工技能树</h2>
          <p className="text-sm text-white/80 font-bold">解锁强大的特殊能力</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MINER_SKILLS.map(skill => {
          const currentLevel = state.minerSkills?.[skill.id] || 0;
          const isMaxLevel = currentLevel >= skill.maxLevel;
          const cost = Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, currentLevel));
          
          let canAfford = false;
          if (skill.costCurrency === 'coins') {
            canAfford = state.coins >= cost;
          } else if (skill.costCurrency === 'gem' && skill.gemType) {
            canAfford = (state.inventory[skill.gemType] || 0) >= cost;
          }

          return (
            <div key={skill.id} className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-sm border-4 border-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg text-slate-700 flex items-center gap-2">
                    {skill.name}
                    <span className="text-xs font-bold bg-fuchsia-100 text-fuchsia-600 px-2 py-0.5 rounded-full border border-fuchsia-200">
                      Lv.{currentLevel}/{skill.maxLevel}
                    </span>
                  </h3>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-3 h-10">{skill.description}</p>
                <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-100 mb-4">
                  <div className="text-xs font-bold text-slate-400 mb-1">当前效果</div>
                  <div className="font-black text-fuchsia-600">
                    {skill.effectType === 'speed' && `+${currentLevel * skill.effectPerLevel}% 挖掘速度`}
                    {skill.effectType === 'gemChance' && `+${currentLevel * skill.effectPerLevel}% 宝石发现率`}
                    {skill.effectType === 'doubleDrop' && `+${currentLevel * skill.effectPerLevel}% 双倍掉落率`}
                    {skill.effectType === 'costReduction' && `-${currentLevel * skill.effectPerLevel}% 雇佣/升级消耗`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpgradeSkill(skill.id)}
                disabled={isMaxLevel || !canAfford}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  isMaxLevel 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : canAfford
                      ? 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white shadow-[0_4px_0_rgba(217,70,239,0.3)] active:translate-y-1 active:shadow-none'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isMaxLevel ? (
                  '已满级'
                ) : (
                  <>
                    <ArrowUpCircle size={18} />
                    升级消耗: 
                    {skill.costCurrency === 'coins' ? (
                      <span className="flex items-center gap-1"><Coins size={14} /> {cost}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Gem size={14} /> {cost} {skill.gemType}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
