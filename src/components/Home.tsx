import React, { useState, useEffect } from 'react';
import { GameState, DigResult } from '../types';
import { getTitleForLevel, getLevelUpRequirement, getCurrentLevelXp, CHARACTERS, SHOVELS, SCENES } from '../gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Play, Video, ChevronDown, ChevronUp, Zap, Pickaxe, RefreshCw } from 'lucide-react';
import ProbabilitiesModal from './ProbabilitiesModal';
import RewardModal from './RewardModal';

interface HomeProps {
  state: GameState;
  onStartDigging: () => void;
  onWatchAd: () => void;
  isDigging: boolean;
  digResult: DigResult | null;
  onCloseReward: () => void;
  onToggleAutoDig: () => void;
  onAddShovels: () => void;
}

export default function Home({ state, onStartDigging, onWatchAd, isDigging, digResult, onCloseReward, onToggleAutoDig, onAddShovels }: HomeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [particles, setParticles] = useState<{id: number, x: number, y: number, size: number, color: string}[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  const [animType, setAnimType] = useState<'normal' | 'gem' | 'rare' | 'rainbow' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDigging) {
      setAnimType('normal');
      const colors = ['bg-amber-800', 'bg-amber-700', 'bg-amber-900', 'bg-stone-600'];
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200,
        y: -Math.random() * 150 - 50,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => {
        setParticles([]);
        setAnimType(null);
      }, 900);
      return () => clearTimeout(timer);
    } else if (digResult && !state.isAutoDigging) {
      // Determine animation type based on result
      let type: 'gem' | 'rare' | 'rainbow' | 'normal' = 'normal';
      if (digResult.gemsEarned.includes('七彩宝石')) {
        type = 'rainbow';
      } else if (digResult.gemsEarned.some(g => ['蓝宝石', '绿宝石', '七彩铲子碎片'].includes(g))) {
        type = 'rare';
      } else if (digResult.gemsEarned.length > 0) {
        type = 'gem';
      }
      
      setAnimType(type);
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
        setAnimType(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isDigging, digResult, state.isAutoDigging]);

  const title = getTitleForLevel(state.level);
  const nextLevelXp = getLevelUpRequirement(state.level);
  const currentXp = getCurrentLevelXp(state.xp);
  const xpNeeded = nextLevelXp - currentXp;

  const activeCoinBuff = state.activeBuffs.find(b => b.type === 'coin_boost' && b.expiresAt > now);
  const activeGemBuff = state.activeBuffs.find(b => b.type === 'gem_boost' && b.expiresAt > now);

  const getSkinEmoji = (skin: string) => {
    const char = CHARACTERS.find(c => c.id === skin);
    return char ? char.emoji : '👨‍🌾';
  };

  const getShovelColor = (shovel: string) => {
    const s = SHOVELS.find(s => s.id === shovel);
    return s ? s.color : 'text-slate-400';
  };

  const currentSceneDef = SCENES.find(s => s.id === state.currentScene) || SCENES[0];

  return (
    <div className="flex flex-col items-center justify-between min-h-full bg-transparent p-6 text-slate-800 font-sans relative overflow-hidden">
      
      {/* Full Screen Rainbow Effect */}
      {animType === 'rainbow' && (
        <motion.div 
          key="rainbow-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 pointer-events-none mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,0,0.5) 0%, rgba(255,154,0,0.5) 10%, rgba(208,222,33,0.5) 20%, rgba(79,220,74,0.5) 30%, rgba(63,218,216,0.5) 40%, rgba(47,201,226,0.5) 50%, rgba(28,127,238,0.5) 60%, rgba(95,21,242,0.5) 70%, rgba(186,12,248,0.5) 80%, rgba(251,7,217,0.5) 90%, rgba(255,0,0,0.5) 100%)',
            animation: 'spin 2s linear infinite'
          }}
        />
      )}

      {/* Header Actions */}
      <div className="w-full max-w-md flex justify-between items-center mt-2 relative z-10">
        <div className="flex flex-col">
          <span className="text-sm font-black text-amber-600 uppercase tracking-wider drop-shadow-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onAddShovels}
            className="px-3 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border-2 border-white text-amber-500 hover:bg-amber-50 transition-colors flex items-center gap-1 text-xs font-black"
          >
            +100 铲子
          </button>
          <button 
            onClick={() => setShowProbabilities(true)}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border-2 border-white text-sky-500 hover:text-sky-600 transition-colors"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Active Buffs */}
      <div className="w-full max-w-md flex gap-2 mt-2 relative z-10">
        {activeCoinBuff && (
          <div className="flex items-center gap-1 bg-amber-400 text-white px-2 py-1 rounded-full text-xs font-black shadow-sm border-2 border-white">
            <Zap size={12} /> 金币+20% ({Math.ceil((activeCoinBuff.expiresAt - now) / 60000)}m)
          </div>
        )}
        {activeGemBuff && (
          <div className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
            <Zap size={12} /> 爆率翻倍 ({Math.ceil((activeGemBuff.expiresAt - now) / 60000)}m)
          </div>
        )}
      </div>

      {/* Center Character / Graphic */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10 mt-4 mb-2"
      >
        <motion.div 
          className={`w-64 h-64 rounded-full flex items-center justify-center shadow-2xl mb-10 relative transition-all duration-300 bg-cover bg-center border-8 ${isDigging ? 'border-amber-400 scale-105' : 'border-white'}`}
          style={{ backgroundImage: currentSceneDef.background }}
          animate={isDigging ? { x: [-3, 3, -3, 3, -2, 2, 0], y: [-2, 2, -2, 2, -1, 1, 0] } : {}}
          transition={{ duration: 0.15, repeat: isDigging ? 6 : 0 }}
        >
          {/* Flash Effect */}
          {showFlash && (
            <motion.div
              key="flash"
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute inset-0 rounded-full z-30 pointer-events-none ${animType === 'rare' || animType === 'rainbow' ? 'bg-amber-300' : 'bg-white'}`}
            />
          )}

          {/* Golden Explosion for Rare Gems */}
          {(animType === 'rare' || animType === 'rainbow') && (
            <motion.div
              key="explosion"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-8 border-amber-300 z-40 pointer-events-none"
            />
          )}

          {/* Dark overlay for better character visibility over complex backgrounds */}
          <div className="absolute inset-0 bg-black/10 rounded-full overflow-hidden">
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 80, opacity: 1, scale: 1 }}
                animate={{ 
                  x: p.x, 
                  y: p.y, 
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 0.7 + Math.random() * 0.3, ease: "easeOut" }}
                className={`absolute rounded-sm z-20 ${p.color}`}
                style={{ 
                  left: '50%', 
                  bottom: '20%', 
                  width: p.size, 
                  height: p.size,
                  marginLeft: -p.size/2
                }}
              />
            ))}
          </div>
          
          <div className="flex items-end gap-1 relative z-10">
            <motion.span 
              className="text-8xl drop-shadow-2xl inline-block"
              animate={isDigging ? { y: [0, -25, 0, -15, 0], rotate: [0, -8, 8, -4, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDigging ? 1 : 0 }}
            >
              {state.customSkins?.[state.equippedSkin] ? (
                <img src={state.customSkins[state.equippedSkin]} alt="Skin" className="w-24 h-24 object-cover rounded-2xl" />
              ) : (
                getSkinEmoji(state.equippedSkin)
              )}
            </motion.span>
            <motion.div
              animate={isDigging ? { rotate: [0, -110, 30, -90, 0], y: [0, 25, -15, 20, 0], x: [0, -20, 15, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDigging ? 1 : 0 }}
              style={{ transformOrigin: 'bottom left' }}
            >
              <Pickaxe size={64} className={`${getShovelColor(state.equippedShovel)} drop-shadow-xl`} />
            </motion.div>
          </div>
          <div className="absolute -bottom-5 bg-slate-800 px-5 py-1.5 rounded-full shadow-lg border-2 border-slate-700 font-black text-amber-400 z-20 text-lg">
            剩余铲子: {state.shovels}
          </div>
        </motion.div>

        {/* Level Progress */}
        <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-xl border-4 border-white mt-4">
          <div className="flex justify-between text-sm mb-3 font-black text-slate-500">
            <span>距离 Lv.{state.level + 1}</span>
            <span className="text-amber-500">还需 {Math.ceil(xpNeeded)} 经验</span>
          </div>
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border-2 border-slate-300/50">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (currentXp / nextLevelXp) * 100))}%` }}
            />
          </div>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-1 mt-4 text-xs font-bold text-slate-400 hover:text-slate-500 transition-colors"
          >
            升级奖励说明 {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showDetails && (
            <motion.div 
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
            >
                <div className="pt-3 mt-3 border-t-2 border-slate-200 text-xs font-bold text-slate-500 space-y-2">
                  <p>• 升级后挖宝获得的随机金币数量乘以 1.08 倍系数</p>
                  <p>• 升级后获得各类宝石的概率根据等级区间变化</p>
                </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Button */}
      <div className="w-full max-w-md pb-12 mt-auto relative z-10 flex flex-col gap-3">
        {state.shovels > 0 ? (
          <>
            <button
              onClick={onStartDigging}
              disabled={isDigging || state.isAutoDigging}
              className={`w-full py-5 rounded-[2rem] font-black text-2xl shadow-[0_8px_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 transition-all border-4 border-white/50 ${
                state.isAutoDigging 
                  ? 'bg-sky-400 text-white cursor-not-allowed'
                  : isDigging
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-[0_4px_0_rgba(0,0,0,0.1)] translate-y-1'
                    : 'bg-amber-400 text-white hover:bg-amber-300'
              }`}
            >
              {state.isAutoDigging ? (
                <>
                  <RefreshCw className="animate-spin" size={28} />
                  自动挖宝中...
                </>
              ) : isDigging ? (
                <>
                  <Pickaxe className="animate-bounce" size={28} />
                  挖掘中...
                </>
              ) : (
                <>
                  <Pickaxe size={28} />
                  开始挖宝
                </>
              )}
            </button>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={onToggleAutoDig}
                className={`flex-1 mr-2 py-3.5 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all border-2 ${
                  state.isAutoDigging 
                    ? 'bg-rose-500 text-white border-rose-400' 
                    : 'bg-white/80 text-slate-600 border-white hover:bg-white'
                }`}
              >
                <RefreshCw size={18} className={state.isAutoDigging ? 'animate-spin' : ''} />
                {state.isAutoDigging ? '停止自动' : '自动挖宝'}
              </button>
              <button
                onClick={onWatchAd}
                className="flex-1 ml-2 py-3.5 bg-emerald-400 text-white rounded-2xl font-bold text-base shadow-md border-2 border-emerald-300 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                <Video size={18} /> 看广告得铲子
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onWatchAd}
            className="w-full py-5 bg-emerald-400 hover:bg-emerald-300 text-white rounded-[2rem] font-black text-2xl shadow-[0_8px_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 transition-all border-4 border-white/50"
          >
            <Video size={28} /> 看广告恢复次数 (+10)
          </button>
        )}
      </div>

      <AnimatePresence>
        {showProbabilities && (
          <ProbabilitiesModal key="probabilities" onClose={() => setShowProbabilities(false)} level={state.level} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {digResult && !state.isAutoDigging && (
          <RewardModal key="reward" result={digResult} onClose={onCloseReward} state={state} />
        )}
      </AnimatePresence>
    </div>
  );
}
