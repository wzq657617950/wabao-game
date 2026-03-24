import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { DigResult, GameState } from '../types';
import { CheckCircle2, Sparkles, Coins } from 'lucide-react';

interface RewardModalProps extends React.ComponentProps<typeof motion.div> {
  result: DigResult;
  onClose: () => void;
  state: GameState;
}

const RewardModal = forwardRef<HTMLDivElement, RewardModalProps>(({ result, onClose, state, ...rest }, ref) => {
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6"
      {...rest}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-4 border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-amber-400 to-orange-500 p-6 text-center relative overflow-hidden border-b-4 border-orange-600">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <Sparkles className="mx-auto text-white mb-2 drop-shadow-md" size={40} />
          <h2 className="text-3xl font-black text-white drop-shadow-lg tracking-wide">挖宝成功！</h2>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-6 bg-slate-50">
          <div className="flex flex-col items-center gap-2 w-full">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">获得奖励</span>
            <div className="flex items-center justify-center gap-6 text-3xl font-black text-amber-500 bg-white w-full py-4 rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Coins size={28} className="text-amber-400 drop-shadow-sm" />
                +{result.coinsEarned}
              </div>
              <div className="w-1 h-8 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-2 text-sky-500">
                <span className="text-xl font-black">XP</span>
                +{result.xpEarned}
              </div>
            </div>
          </div>

          {result.gemsEarned.length > 0 && (
            <div className="w-full">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center mb-3">稀有掉落</span>
              <div className="flex flex-wrap justify-center gap-2">
                {result.gemsEarned.map((gem, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-2xl text-sm font-black border-2 border-indigo-200 flex items-center gap-2 shadow-sm"
                  >
                    {state.customGems?.[gem] ? (
                      <img src={state.customGems[gem]} alt={gem} className="w-6 h-6 object-cover rounded-md" />
                    ) : (
                      <span>💎</span>
                    )}
                    {gem}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.materialsEarned && result.materialsEarned.length > 0 && (
            <div className="w-full">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center mb-3">建筑材料</span>
              <div className="flex flex-wrap justify-center gap-2">
                {result.materialsEarned.map((mat, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-2 bg-orange-100 text-orange-600 rounded-2xl text-sm font-black border-2 border-orange-200 flex items-center gap-1 shadow-sm"
                  >
                    🧱 {mat}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.gearEarned && (
            <div className="w-full">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center mb-3">意外收获</span>
              <div className="flex justify-center">
                <div className={`px-4 py-3 bg-fuchsia-100 text-fuchsia-700 rounded-2xl text-sm font-black border-2 border-fuchsia-300 flex flex-col items-center gap-1 shadow-md w-full`}>
                  <div className="flex items-center gap-2 text-lg">
                    🛡️ {result.gearEarned.name}
                  </div>
                  <div className="text-xs opacity-80">
                    等级: {result.gearEarned.level} | 战力: {result.gearEarned.power}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.shovelsEarned && result.shovelsEarned > 0 && (
            <div className="w-full">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center mb-3">额外奖励</span>
              <div className="flex justify-center">
                <div className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-2xl text-sm font-black border-2 border-emerald-200 flex items-center gap-1 shadow-sm">
                  ⛏️ 铲子 +{result.shovelsEarned}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-2 py-4 bg-sky-400 hover:bg-sky-500 text-white rounded-[2rem] font-black text-xl shadow-[0_6px_0_#0284c7] active:shadow-[0_0px_0_#0284c7] active:translate-y-[6px] flex items-center justify-center gap-2 transition-all border-4 border-white"
          >
            <CheckCircle2 size={24} /> 收下奖励
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default RewardModal;
