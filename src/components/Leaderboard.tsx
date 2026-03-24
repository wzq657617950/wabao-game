import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import { Trophy, Crown, Gem, Coins, Users } from 'lucide-react';

interface LeaderboardProps {
  state: GameState;
  onBack?: () => void;
}

type LeaderboardRow = {
  rank: number;
  userId: string;
  username: string;
  coins: number;
};

const apiBaseUrl = (typeof window !== 'undefined' ? (window.localStorage.getItem('treasure_api_base_url_v1') || '') : '').replace(/\/$/, '');

const buildApiUrl = (path: string) => {
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path}`;
};

export default function Leaderboard({ state, onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'wealth' | 'lucky' | 'friends'>('wealth');
  const [remoteWealth, setRemoteWealth] = useState<LeaderboardRow[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    let canceled = false;
    const userId = localStorage.getItem('treasure_user_id_v1') || '';

    const load = async () => {
      try {
        setLoadingRemote(true);
        const res = await fetch(buildApiUrl('/api/leaderboard?limit=50'));
        if (!res.ok) return;
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) return;
        const rows: LeaderboardRow[] = json.data.map((row: any, index: number) => ({
          rank: Number(row.rank || index + 1),
          userId: String(row.userId || ''),
          username: String(row.username || `玩家_${index + 1}`),
          coins: Number(row.coins || 0),
        }));
        if (!canceled) {
          const meRow = rows.find(row => row.userId === userId);
          if (meRow) {
            const others = rows.filter(row => row.userId !== userId);
            setRemoteWealth([...others, meRow].sort((a, b) => a.rank - b.rank));
          } else {
            setRemoteWealth(rows);
          }
        }
      } catch {
      } finally {
        if (!canceled) setLoadingRemote(false);
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      canceled = true;
      window.clearInterval(timer);
    };
  }, []);

  const fallbackWealthData = [
    { rank: 1, name: '挖宝大亨', value: 999999, isMe: false },
    { rank: 2, name: '金币收集者', value: 850000, isMe: false },
    { rank: 3, name: '矿区首富', value: 720000, isMe: false },
    { rank: 4, name: '我', value: state.totalCoinsEarned, isMe: true },
    { rank: 5, name: '路人甲', value: 50000, isMe: false },
  ].sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, rank: index + 1 }));

  const currentUserId = localStorage.getItem('treasure_user_id_v1') || '';
  const wealthData = remoteWealth.length > 0
    ? remoteWealth.map(item => ({
      rank: item.rank,
      name: item.username,
      value: item.coins,
      isMe: item.userId === currentUserId,
    }))
    : fallbackWealthData;

  const luckyData = [
    { rank: 1, name: '欧皇本皇', value: 15, isMe: false }, // Number of rare gems
    { rank: 2, name: '天选之子', value: 12, isMe: false },
    { rank: 3, name: '运气爆棚', value: 8, isMe: false },
    { rank: 4, name: '我', value: state.inventory['七彩宝石'] + state.inventory['蓝宝石'], isMe: true },
    { rank: 5, name: '非酋', value: 0, isMe: false },
  ].sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, rank: index + 1 }));

  const friendsData = [
    { rank: 1, name: '张三 (好友)', value: 120000, isMe: false },
    { rank: 2, name: '我', value: state.totalCoinsEarned, isMe: true },
    { rank: 3, name: '李四 (好友)', value: 45000, isMe: false },
  ].sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, rank: index + 1 }));

  const currentData = activeTab === 'wealth' ? wealthData : activeTab === 'lucky' ? luckyData : friendsData;

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-800 font-sans pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 bg-white/80 backdrop-blur-md rounded-xl border-2 border-white shadow-sm text-slate-600 hover:bg-white active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
            <Trophy className="text-amber-400" /> 排行榜
          </h1>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-md border-2 border-white px-3 py-1.5 rounded-full shadow-sm">
          {loadingRemote ? '数据同步中' : '每周日 24:00 结算'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/80 backdrop-blur-md border-4 border-white p-1.5 rounded-2xl mb-6 shadow-sm">
        <button 
          onClick={() => setActiveTab('wealth')}
          className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'wealth' ? 'bg-amber-100 text-amber-600 shadow-sm border-2 border-amber-200' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <Coins size={18} /> 财富榜
        </button>
        <button 
          onClick={() => setActiveTab('lucky')}
          className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'lucky' ? 'bg-indigo-100 text-indigo-600 shadow-sm border-2 border-indigo-200' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <Gem size={18} /> 欧皇榜
        </button>
        <button 
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'friends' ? 'bg-emerald-100 text-emerald-600 shadow-sm border-2 border-emerald-200' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <Users size={18} /> 好友榜
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentData.map((item) => (
          <div 
            key={item.name} 
            className={`flex items-center justify-between p-4 rounded-2xl border-4 transition-all shadow-sm ${
              item.isMe ? 'bg-amber-50 border-amber-200' : 'bg-white/90 backdrop-blur-md border-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-lg border-2 shadow-inner ${
                item.rank === 1 ? 'bg-amber-100 text-amber-500 border-amber-200' :
                item.rank === 2 ? 'bg-slate-100 text-slate-400 border-slate-200' :
                item.rank === 3 ? 'bg-orange-100 text-orange-500 border-orange-200' :
                'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {item.rank <= 3 ? <Crown size={20} /> : item.rank}
              </div>
              <div className="font-black text-slate-700 text-lg">
                {item.name}
                {item.isMe && <span className="ml-2 text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-black shadow-sm">我</span>}
              </div>
            </div>
            <div className="font-mono font-black text-slate-600 text-lg flex items-center gap-1">
              {activeTab === 'lucky' ? <Gem size={18} className="text-indigo-400" /> : <Coins size={18} className="text-amber-400" />}
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
