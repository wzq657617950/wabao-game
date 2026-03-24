import React, { useState, useEffect } from 'react';
import { GameState, Opponent } from '../types';
import { OPPONENTS, getPlayerStats } from '../gameLogic';
import { ArrowLeft, Target, Shield, Sword, Coins, Search, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../sound';

interface PlunderProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onBack: () => void;
}

export default function Plunder({ state, setState, onBack }: PlunderProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [battleResult, setBattleResult] = useState<{ win: boolean; log: string[]; reward?: { coins: number, gems?: Record<string, number>, materials?: Record<string, number> } } | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  
  const playerStats = getPlayerStats(state);

  const handlePlunder = (opponent: Opponent) => {
    if (state.coins < opponent.costCoins) {
      alert('金币不足以发起掠夺！');
      return;
    }

    setIsBattling(true);
    soundManager.playClick(); // Maybe a battle start sound

    // Deduct cost
    setState(prev => prev ? { ...prev, coins: prev.coins - opponent.costCoins } : prev);

    setTimeout(() => {
      // Simple battle calculation
      const playerPower = playerStats.power * (0.8 + Math.random() * 0.4);
      const enemyPower = opponent.power * (0.8 + Math.random() * 0.4);
      
      const win = playerPower > enemyPower;
      const log = [
        `战斗开始！你发起了突袭。`,
        `你的战斗力评估: ${Math.floor(playerPower)}`,
        `对手的战斗力评估: ${Math.floor(enemyPower)}`
      ];

      if (win) {
        log.push(`🎉 战斗胜利！你成功掠夺了对方的资源。`);
        
        // Plunder bonus logic
        const bonusMultiplier = 1 + (playerStats.plunderBonus || 0);
        const rewardCoins = Math.floor(opponent.rewardCoins * bonusMultiplier);
        
        const rewardGems: Record<string, number> = {};
        const rewardMaterials: Record<string, number> = {};
        
        // Add random chance to get gems/materials
        if (opponent.rewardGems && Math.random() < 0.5) {
            const gem = opponent.rewardGems[Math.floor(Math.random() * opponent.rewardGems.length)];
            rewardGems[gem] = 1;
        }
        if (opponent.rewardMaterials && Math.random() < 0.8) {
            const mat = opponent.rewardMaterials[Math.floor(Math.random() * opponent.rewardMaterials.length)];
            rewardMaterials[mat] = Math.floor(Math.random() * 3) + 1;
        }
        
        setState(prev => {
          if (!prev) return prev;
          const newInventory = { ...prev.inventory };
          const newMaterials = { ...prev.materials };
          
          Object.keys(rewardGems).forEach(gem => {
              newInventory[gem] = (newInventory[gem] || 0) + rewardGems[gem];
          });
          Object.keys(rewardMaterials).forEach(mat => {
              newMaterials[mat] = (newMaterials[mat] || 0) + rewardMaterials[mat];
          });

          return { 
            ...prev, 
            coins: prev.coins + rewardCoins,
            totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
            inventory: newInventory,
            materials: newMaterials
          };
        });
        
        setBattleResult({ win: true, log, reward: { coins: rewardCoins, gems: rewardGems, materials: rewardMaterials } });
        soundManager.playCoin();
      } else {
        log.push(`💀 战斗失败！你被对方击退了。`);
        setBattleResult({ win: false, log });
      }
      
      setIsBattling(false);
    }, 1500);
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
          <Target className="text-rose-400" /> 掠夺系统
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-700 mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-400 mb-1">我的战斗力</div>
          <div className="text-3xl font-black text-white flex items-center gap-2">
            <Sword size={24} className="text-sky-400" />
            {playerStats.power.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-400 mb-1">掠夺加成</div>
          <div className="text-xl font-black text-rose-400">
            +{Math.floor(playerStats.plunderBonus * 100)}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {OPPONENTS.map((opp) => (
          <div key={opp.id} className="bg-slate-800 rounded-3xl p-5 border-2 border-slate-700 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-white">{opp.name}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">{opp.description}</p>
              </div>
              <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 font-bold">推荐战力</span>
                <div className="text-sm font-black text-amber-400">{opp.power.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500">可能掉落:</div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-black border border-amber-500/20 flex items-center gap-1">
                    <Coins size={12} /> {opp.rewardCoins.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOpponent(opp)}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Search size={16} /> 搜寻
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedOpponent && !isBattling && !battleResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedOpponent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 border-slate-600"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-white mb-2 text-center">确认掠夺？</h2>
              <p className="text-slate-400 text-center mb-6 font-bold">目标: {selectedOpponent.name}</p>
              
              <div className="bg-slate-900 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 font-bold">消耗金币</span>
                  <span className="text-rose-400 font-black flex items-center gap-1"><Coins size={16} /> {selectedOpponent.costCoins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">胜率预估</span>
                  <span className={`font-black ${playerStats.power > selectedOpponent.power * 1.5 ? 'text-emerald-400' : playerStats.power > selectedOpponent.power ? 'text-amber-400' : 'text-rose-400'}`}>
                    {playerStats.power > selectedOpponent.power * 1.5 ? '极高' : playerStats.power > selectedOpponent.power ? '势均力敌' : '危险'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedOpponent(null)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => handlePlunder(selectedOpponent)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Swords size={18} /> 发起攻击
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
            <h2 className="text-2xl font-black text-white tracking-widest animate-pulse">激战中...</h2>
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
                  {battleResult.win ? '掠夺成功！' : '掠夺失败！'}
                </h2>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 mb-6 space-y-2">
                {battleResult.log.map((line, idx) => (
                  <div key={idx} className="text-sm font-bold text-slate-300">{line}</div>
                ))}
              </div>

              {battleResult.win && battleResult.reward && (
                <div className="bg-emerald-800/50 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-200">获得金币</span>
                    <span className="font-black text-emerald-400 flex items-center gap-1">
                      <Coins size={18} /> +{battleResult.reward.coins.toLocaleString()}
                    </span>
                  </div>
                  {battleResult.reward.gems && Object.entries(battleResult.reward.gems).map(([gem, count]) => (
                    <div key={gem} className="flex justify-between items-center">
                      <span className="font-bold text-emerald-200">获得宝石</span>
                      <span className="font-black text-emerald-400 flex items-center gap-1">
                        💎 {gem} x{count}
                      </span>
                    </div>
                  ))}
                  {battleResult.reward.materials && Object.entries(battleResult.reward.materials).map(([mat, count]) => (
                    <div key={mat} className="flex justify-between items-center">
                      <span className="font-bold text-emerald-200">获得材料</span>
                      <span className="font-black text-emerald-400 flex items-center gap-1">
                        🧱 {mat} x{count}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => {
                  setBattleResult(null);
                  setSelectedOpponent(null);
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
