import React from 'react';
import { GameState } from '../types';
import { SCENES } from '../gameLogic';
import { Check, Lock, Coins } from 'lucide-react';

interface SceneShopProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export default function SceneShop({ state, setState }: SceneShopProps) {
  const handlePurchase = (sceneId: string, cost: number) => {
    if (state.coins >= cost) {
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coins: prev.coins - cost,
          ownedScenes: [...prev.ownedScenes, sceneId],
          currentScene: sceneId,
        };
      });
    }
  };

  const handleEquip = (sceneId: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentScene: sceneId,
      };
    });
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white">场景商店</h2>
          <p className="text-slate-400 text-sm mt-1">购买并更换你的挖宝环境</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
          <Coins className="text-amber-400" size={20} />
          <span className="text-amber-400 font-bold text-lg">{state.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SCENES.map(scene => {
          const isOwned = state.ownedScenes.includes(scene.id);
          const isEquipped = state.currentScene === scene.id;
          const canAfford = state.coins >= scene.cost;

          return (
            <div 
              key={scene.id}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                isEquipped ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {/* Background Preview */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity hover:opacity-60"
                style={{ backgroundImage: scene.background }}
              />
              
              {/* Content Overlay */}
              <div className="relative z-10 p-4 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent">
                <div className="flex justify-between items-end mt-12">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {scene.name}
                      {isEquipped && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">使用中</span>}
                    </h3>
                    <p className="text-slate-300 text-sm mt-1">{scene.description}</p>
                  </div>

                  <div>
                    {isOwned ? (
                      <button
                        onClick={() => handleEquip(scene.id)}
                        disabled={isEquipped}
                        className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          isEquipped 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95'
                        }`}
                      >
                        {isEquipped ? <><Check size={16} /> 已装备</> : '装备'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(scene.id, scene.cost)}
                        disabled={!canAfford}
                        className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          canAfford 
                            ? 'bg-amber-500 hover:bg-amber-400 text-white active:scale-95 shadow-lg shadow-amber-500/20' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock size={16} />
                        {scene.cost.toLocaleString()} 金币
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
