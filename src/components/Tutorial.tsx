import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Home, Store, Mountain, ChevronRight, Check } from 'lucide-react';
import { soundManager } from '../sound';

interface TutorialProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '欢迎来到挖宝世界！',
    content: '在这里，你将成为一名寻宝猎人。通过挖掘矿洞，收集宝石和材料，最终建造属于你的宇宙神殿！',
    icon: <Mountain size={40} className="text-emerald-500" />,
    color: 'bg-emerald-100 border-emerald-200'
  },
  {
    title: '核心玩法：挖掘',
    content: '在【矿洞】中，点击屏幕中央的矿石即可进行挖掘。每次挖掘都会消耗体力（铲子耐久度），并有几率获得金币、宝石和建筑材料。',
    icon: <Pickaxe size={40} className="text-amber-500" />,
    color: 'bg-amber-100 border-amber-200'
  },
  {
    title: '升级房屋',
    content: '收集到足够的材料后，前往【房屋】界面升级你的住所。更高级的房屋不仅能增加仓库容量，还能提升挖宝的暴击率和金币收益！',
    icon: <Home size={40} className="text-indigo-500" />,
    color: 'bg-indigo-100 border-indigo-200'
  },
  {
    title: '购买装备',
    content: '在【商店】中，你可以用收集到的碎片兑换更高级的铲子，或者购买限时增益效果，让你的挖宝之旅事半功倍。',
    icon: <Store size={40} className="text-sky-500" />,
    color: 'bg-sky-100 border-sky-200'
  },
  {
    title: '准备出发！',
    content: '现在，拿起你的第一把铁铲，开始你的寻宝之旅吧！祝你好运！',
    icon: <Check size={40} className="text-rose-500" />,
    color: 'bg-rose-100 border-rose-200'
  }
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    soundManager.playClick();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-white relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-50 ${step.color.split(' ')[0]}`}></div>
          <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-50 ${step.color.split(' ')[0]}`}></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border-4 shadow-inner ${step.color}`}>
              {step.icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-4">{step.title}</h2>
            <p className="text-slate-600 font-bold leading-relaxed mb-8">
              {step.content}
            </p>

            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-indigo-500' : 'w-2.5 bg-slate-200'}`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-[0_4px_0_rgba(99,102,241,1)] active:translate-y-1 active:shadow-none"
              >
                {currentStep < TUTORIAL_STEPS.length - 1 ? (
                  <>下一步 <ChevronRight size={20} /></>
                ) : (
                  <>开始游戏 <Check size={20} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
