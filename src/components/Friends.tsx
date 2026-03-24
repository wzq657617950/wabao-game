import React, { useState } from 'react';
import { GameState, Friend } from '../types';
import { Users, UserPlus, Gift, Home as HomeIcon, CheckCircle, ArrowLeft } from 'lucide-react';
import { soundManager } from '../sound';
import { HOUSES } from '../gameLogic';

const HOUSE_IMAGES: Record<number, string> = {
  0: '⛺', // Tent
  1: '🛖', // Wooden Hut
  2: '🏠', // Brick House
  3: '🏡', // Villa
  4: '🏰', // Castle
  5: '🏛️', // Mansion
  6: '🏯', // Palace
  7: '👑', // Royal Palace
  8: '☁️', // Sky Castle
  9: '🚀', // Space Station
  10: '🌌', // Galactic Empire
  11: '✨', // Cosmic Nexus
  12: '🌀', // Dimensional Rift
  13: '♾️'
};

interface FriendsProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onBack?: () => void;
}

export default function Friends({ state, setState, onBack }: FriendsProps) {
  const [newFriendName, setNewFriendName] = useState('');
  const [visitingFriend, setVisitingFriend] = useState<Friend | null>(null);

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    
    soundManager.playClick();
    const newFriend: Friend = {
      id: `f_${Date.now()}`,
      name: newFriendName,
      level: Math.floor(Math.random() * 20) + 1,
      houseLevel: Math.floor(Math.random() * 5),
      lastGiftTime: 0,
      avatar: ['👨‍🌾', '👷', '🤺', '🥷', '🏴‍☠️', '🧑‍🚀', '🤖'][Math.floor(Math.random() * 7)]
    };

    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        friends: [...(prev.friends || []), newFriend]
      };
    });
    setNewFriendName('');
  };

  const handleGiftShovel = (friendId: string) => {
    if (state.shovels < 10) return; // Need at least 10 shovels to gift
    
    soundManager.playCoin();
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        shovels: prev.shovels - 10,
        friends: prev.friends?.map(f => 
          f.id === friendId ? { ...f, lastGiftTime: Date.now() } : f
        )
      };
    });
  };

  const canGift = (lastGiftTime: number) => {
    const now = Date.now();
    // Can gift once per day (86400000 ms)
    return now - lastGiftTime > 86400000;
  };

  if (visitingFriend) {
    const friendHouse = HOUSES[visitingFriend.houseLevel] || HOUSES[0];
    return (
      <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-white">
              {visitingFriend.avatar}
            </div>
            <div>
              <h1 className="text-xl font-black text-white drop-shadow-md">{visitingFriend.name} 的家</h1>
              <p className="text-sm text-white/80 font-bold">Lv.{visitingFriend.level}</p>
            </div>
          </div>
          <button 
            onClick={() => setVisitingFriend(null)}
            className="px-4 py-2 bg-white/80 text-slate-600 rounded-xl font-black text-sm shadow-sm hover:bg-white transition-colors"
          >
            返回
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border-4 border-white text-center">
          <div className="w-full h-48 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 border-4 border-indigo-200 overflow-hidden text-6xl drop-shadow-md">
            {HOUSE_IMAGES[visitingFriend.houseLevel] || '⛺'}
          </div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">{friendHouse.name}</h2>
          <p className="text-slate-500 font-bold mb-6">房屋等级: {visitingFriend.houseLevel}</p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
              <div className="text-xs text-slate-400 font-bold mb-1">仓库容量</div>
              <div className="font-black text-slate-700">{friendHouse.capacity}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
              <div className="text-xs text-slate-400 font-bold mb-1">金币加成</div>
              <div className="font-black text-slate-700">x{friendHouse.coinBoost}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-32">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-2xl border-4 border-white shadow-sm">
            <Users className="text-indigo-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight">好友</h1>
            <p className="text-sm text-white/80 font-bold">与好友互动，互赠铲子</p>
          </div>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-white/80 text-slate-600 rounded-xl font-black text-sm shadow-sm hover:bg-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={16} /> 返回
          </button>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border-4 border-white mb-6 flex gap-2">
        <input 
          type="text" 
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          placeholder="输入好友名称添加..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button 
          onClick={handleAddFriend}
          disabled={!newFriendName.trim()}
          className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-black shadow-sm transition-colors flex items-center gap-1"
        >
          <UserPlus size={18} /> 添加
        </button>
      </div>

      <div className="space-y-4">
        {state.friends?.map(friend => (
          <div 
            key={friend.id} 
            className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border-4 border-white flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
            onClick={() => setVisitingFriend(friend)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl border-2 border-slate-200">
                {friend.avatar}
              </div>
              <div>
                <h3 className="font-black text-slate-700">{friend.name}</h3>
                <p className="text-xs font-bold text-slate-500">Lv.{friend.level} | 房屋: {friend.houseLevel}级</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setVisitingFriend(friend);
                }}
                className="p-2 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition-colors"
                title="拜访房屋"
              >
                <HomeIcon size={20} />
              </button>
              
              {canGift(friend.lastGiftTime) ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGiftShovel(friend.id);
                  }}
                  disabled={state.shovels < 10}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                    state.shovels >= 10 
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title="赠送10把铲子"
                >
                  <Gift size={20} />
                </button>
              ) : (
                <div className="p-2 bg-emerald-100 text-emerald-500 rounded-xl" title="今日已赠送">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {(!state.friends || state.friends.length === 0) && (
          <div className="text-center py-10 text-white/80 font-bold">
            暂无好友，快去添加吧！
          </div>
        )}
      </div>
    </div>
  );
}
