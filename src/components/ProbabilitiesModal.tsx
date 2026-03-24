import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { X, Info } from 'lucide-react';
import { getProbabilities } from '../gameLogic';

interface ProbabilitiesModalProps extends React.ComponentProps<typeof motion.div> {
  onClose: () => void;
  level: number;
}

const ProbabilitiesModal = forwardRef<HTMLDivElement, ProbabilitiesModalProps>(({ onClose, level, ...rest }, ref) => {
  const probs = getProbabilities(level);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      {...rest}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border-4 border-slate-200"
      >
        <div className="flex justify-between items-center p-6 border-b-4 border-slate-100 bg-slate-50">
          <h2 className="text-2xl font-black text-slate-700 flex items-center gap-2">
            <Info size={28} className="text-sky-500" /> 概率公示
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-200 rounded-full shadow-sm text-slate-500 hover:text-slate-700 hover:bg-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="mb-6 p-4 bg-amber-100 rounded-2xl border-2 border-amber-200 text-sm text-amber-700 shadow-sm">
            <p className="font-black mb-1 text-amber-600 text-lg">当前等级加成 (Lv.{level})</p>
            <p className="font-bold">基础金币: 5-10</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">宝石掉落概率</h3>
            {Object.entries(probs.gems).map(([name, baseProb]) => {
              return (
                <div key={name} className="flex justify-between items-center p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                  <span className="font-black text-slate-700 text-lg">{name}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-lg font-black text-indigo-500">
                      {(baseProb * 100).toFixed(4)}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2 mt-6">建筑材料掉落概率</h3>
            {Object.entries(probs.mats).map(([name, baseProb]) => {
              return (
                <div key={name} className="flex justify-between items-center p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                  <span className="font-black text-slate-700 text-lg">{name}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-lg font-black text-amber-500">
                      {(baseProb * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ProbabilitiesModal;
