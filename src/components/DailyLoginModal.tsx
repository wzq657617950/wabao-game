import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { Calendar, Check, Gift } from 'lucide-react';

interface DailyLoginModalProps extends React.ComponentProps<typeof motion.div> {
  consecutiveLogins: number;
  onClaim: () => void;
  onClose: () => void;
}

const REWARDS = [
  { day: 1, coins: 100, shovels: 10 },
  { day: 2, coins: 200, shovels: 20 },
  { day: 3, coins: 500, shovels: 30 },
  { day: 4, coins: 1000, shovels: 40 },
  { day: 5, coins: 2000, shovels: 50 },
  { day: 6, coins: 5000, shovels: 80 },
  { day: 7, coins: 10000, shovels: 100, special: '神秘宝石箱' },
];

const DailyLoginModal = forwardRef<HTMLDivElement, DailyLoginModalProps>(({ consecutiveLogins, onClaim, onClose, ...rest }, ref) => {
  // Cap at 7 days for display
  const displayDay = Math.min(consecutiveLogins, 7);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      {...rest}
    >
      <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl overflow-hidden relative border-4 border-slate-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-300 to-white -z-10"></div>
          
          <div className="text-center mb-6 pt-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border-4 border-sky-200">
              <Calendar size={48} className="text-sky-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-700 mb-1">每日登录奖励</h2>
            <p className="text-slate-500 font-bold">连续登录第 <span className="text-amber-500 font-black text-xl">{consecutiveLogins}</span> 天</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {REWARDS.map((reward, index) => {
              const isPast = index < displayDay - 1;
              const isToday = index === displayDay - 1;
              const isFuture = index > displayDay - 1;
              const isDay7 = index === 6;

              return (
                <div 
                  key={index}
                  className={`relative rounded-2xl border-2 p-2 flex flex-col items-center justify-center text-center
                    ${isDay7 ? 'col-span-4 flex-row justify-around py-4' : 'aspect-square'}
                    ${isPast ? 'bg-slate-100 border-slate-200 opacity-60' : ''}
                    ${isToday ? 'bg-amber-100 border-amber-400 shadow-md transform scale-105 z-10' : ''}
                    ${isFuture ? 'bg-white border-slate-200' : ''}
                  `}
                >
                  {isPast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 rounded-xl backdrop-blur-[1px]">
                      <Check size={32} className="text-emerald-500" />
                    </div>
                  )}
                  
                  <div className={`text-xs font-black mb-1 ${isToday ? 'text-amber-600' : 'text-slate-400'}`}>
                    第 {reward.day} 天
                  </div>
                  
                  <div className={`flex ${isDay7 ? 'flex-row gap-6' : 'flex-col gap-1'} items-center`}>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 font-bold text-lg">💰</span>
                      <span className={`text-sm font-black ${isToday ? 'text-amber-600' : 'text-slate-600'}`}>
                        {reward.coins >= 1000 ? `${reward.coins / 1000}k` : reward.coins}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold text-lg">⛏️</span>
                      <span className={`text-sm font-black ${isToday ? 'text-amber-600' : 'text-slate-600'}`}>
                        {reward.shovels}
                      </span>
                    </div>
                    {reward.special && (
                      <div className="flex items-center gap-1 bg-fuchsia-100 px-2 py-1 rounded-full border border-fuchsia-200">
                        <Gift size={16} className="text-fuchsia-500" />
                        <span className="text-xs font-black text-fuchsia-600">{reward.special}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClaim}
            className="w-full py-4 bg-sky-400 hover:bg-sky-500 text-white rounded-[2rem] font-black text-xl shadow-[0_6px_0_#0284c7] active:shadow-[0_0px_0_#0284c7] active:translate-y-[6px] flex items-center justify-center gap-2 transition-all border-4 border-white"
          >
            领取今日奖励
          </button>
        </motion.div>
    </motion.div>
  );
});

export default DailyLoginModal;
