import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Coins, Pickaxe, Package, Clock, Play, X } from 'lucide-react';

interface OfflineRewardModalProps extends React.ComponentProps<typeof motion.div> {
  reward: {
    timeMs: number;
    digs: number;
    coins: number;
    xp: number;
    gems: Record<string, number>;
    materials: Record<string, number>;
    shovels: number;
  };
  onClaim: (multiplier: number) => void;
}

const OfflineRewardModal = forwardRef<HTMLDivElement, OfflineRewardModalProps>(({ reward, onClaim, ...rest }, ref) => {
  const hours = Math.floor(reward.timeMs / (1000 * 60 * 60));
  const minutes = Math.floor((reward.timeMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      {...rest}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-sky-200 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-400 to-transparent opacity-20" />
        
        <div className="relative z-10 text-center mb-6">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner border-4 border-white">
            <Clock size={40} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">离线收益</h2>
          <p className="text-slate-500 font-bold mt-1">
            你离开的 {hours > 0 ? `${hours}小时 ` : ''}{minutes}分钟 里：
          </p>
          {reward.digs > 0 && (
            <p className="text-sm text-sky-600 font-bold mt-1">
              矿工共挖掘了 {reward.digs} 次
            </p>
          )}
          {reward.shovels > 0 && (
            <p className="text-sm text-emerald-600 font-bold mt-1">
              房屋为你生产了 {reward.shovels} 把铲子
            </p>
          )}
        </div>

        <div className="space-y-3 mb-6 relative z-10 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {reward.shovels > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 font-black">
                <Pickaxe size={20} /> 铲子
              </div>
              <span className="font-black text-emerald-500">+{reward.shovels}</span>
            </div>
          )}

          {reward.coins > 0 && (
            <div className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 font-black">
                <Coins size={20} /> 金币
              </div>
              <span className="font-black text-amber-500">+{reward.coins}</span>
            </div>
          )}

          {Object.entries(reward.gems).map(([gem, count]) => (
            <div key={gem} className="flex items-center justify-between bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-600 font-black">
                <span>💎</span> {gem}
              </div>
              <span className="font-black text-rose-500">+{count}</span>
            </div>
          ))}

          {Object.entries(reward.materials).map(([mat, count]) => (
            <div key={mat} className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 font-black">
                <span>📦</span> {mat}
              </div>
              <span className="font-black text-emerald-500">+{count}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <button
            onClick={() => onClaim(2)}
            className="w-full py-3.5 bg-sky-400 hover:bg-sky-300 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_rgba(56,189,248,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" /> 看广告双倍领取
          </button>
          <button
            onClick={() => onClaim(1)}
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-lg transition-all"
          >
            直接领取
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default OfflineRewardModal;
