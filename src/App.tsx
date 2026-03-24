import React, { useState, useEffect, useRef } from 'react';
import { GameState, DigResult } from './types';
import { loadState, saveState, performDig, HOUSES, GEM_VALUES, getLevelFromXp, SCENES, handleDurability, MINES } from './gameLogic';
import Home from './components/Home';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import Backpack from './components/Backpack';
import House from './components/House';
import Mine from './components/Mine';
import Museum from './components/Museum';
import DailyLoginModal from './components/DailyLoginModal';
import Miners from './components/Miners';
import Me from './components/Me';
import Quests from './components/Quests';
import Tutorial from './components/Tutorial';
import Equipment from './components/Equipment';
import OfflineRewardModal from './components/OfflineRewardModal';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Store, Trophy, Package, Home as HomeIcon, Mountain, BookOpen, Coins, Volume2, VolumeX, Users, User, Gift, Sparkles, Shield } from 'lucide-react';
import { soundManager } from './sound';
import { GemType, MaterialType } from './types';
import { MINER_TIERS } from './gameLogic';

const STORAGE_KEYS = {
  userId: 'treasure_user_id_v1',
  sessionToken: 'treasure_session_token_v1',
  deviceId: 'treasure_device_id_v1',
  username: 'treasure_username_v1',
};

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

const apiBaseUrl = (typeof window !== 'undefined' ? (window.localStorage.getItem('treasure_api_base_url_v1') || '') : '').replace(/\/$/, '');

const buildApiUrl = (path: string) => {
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path}`;
};

const ensureDeviceId = () => {
  const current = localStorage.getItem(STORAGE_KEYS.deviceId);
  if (current) return current;
  const generated = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `device_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(STORAGE_KEYS.deviceId, generated);
  return generated;
};

const mergeRemoteState = (localState: GameState, remoteState: unknown): GameState => {
  if (!remoteState || typeof remoteState !== 'object' || Array.isArray(remoteState)) return localState;
  const next = remoteState as Partial<GameState>;
  return {
    ...localState,
    ...next,
    inventory: {
      ...localState.inventory,
      ...(next.inventory || {}),
    },
    materials: {
      ...localState.materials,
      ...(next.materials || {}),
    },
    prdCounters: {
      ...localState.prdCounters,
      ...(next.prdCounters || {}),
    },
    minerSkills: {
      ...(localState.minerSkills || {}),
      ...(next.minerSkills || {}),
    },
    questsProgress: {
      ...(localState.questsProgress || {}),
      ...(next.questsProgress || {}),
    },
    equippedGear: {
      ...(localState.equippedGear || {}),
      ...(next.equippedGear || {}),
    },
    customSkins: {
      ...(localState.customSkins || {}),
      ...(next.customSkins || {}),
    },
    customGems: {
      ...(localState.customGems || {}),
      ...(next.customGems || {}),
    },
    customHouses: {
      ...(localState.customHouses || {}),
      ...(next.customHouses || {}),
    },
    shovelDurability: {
      ...(localState.shovelDurability || {}),
      ...(next.shovelDurability || {}),
    },
    unlockedMines: Array.isArray(next.unlockedMines) ? next.unlockedMines : localState.unlockedMines,
    unlockedSkins: Array.isArray(next.unlockedSkins) ? next.unlockedSkins : localState.unlockedSkins,
    unlockedShovels: Array.isArray(next.unlockedShovels) ? next.unlockedShovels : localState.unlockedShovels,
    activeBuffs: Array.isArray(next.activeBuffs) ? next.activeBuffs : localState.activeBuffs,
    ownedScenes: Array.isArray(next.ownedScenes) ? next.ownedScenes : localState.ownedScenes,
    unlockedAchievements: Array.isArray(next.unlockedAchievements) ? next.unlockedAchievements : localState.unlockedAchievements,
    discoveredGems: Array.isArray(next.discoveredGems) ? next.discoveredGems : localState.discoveredGems,
    inventoryGear: Array.isArray(next.inventoryGear) ? next.inventoryGear : localState.inventoryGear,
    completedQuests: Array.isArray(next.completedQuests) ? next.completedQuests : localState.completedQuests,
    friends: Array.isArray(next.friends) ? next.friends : localState.friends,
    defeatedBosses: Array.isArray(next.defeatedBosses) ? next.defeatedBosses : localState.defeatedBosses,
  };
};

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'equipment' | 'backpack' | 'house' | 'mine' | 'museum' | 'shop' | 'miners' | 'me' | 'quests' | 'achievements'>('home');
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  
  // Digging state
  const [isDigging, setIsDigging] = useState(false);
  const [digResult, setDigResult] = useState<DigResult | null>(null);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [username, setUsername] = useState(localStorage.getItem(STORAGE_KEYS.username) || '游客');
  const [userId, setUserId] = useState(localStorage.getItem(STORAGE_KEYS.userId) || '');
  const [myRank, setMyRank] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [offlineReward, setOfflineReward] = useState<{
    timeMs: number;
    digs: number;
    coins: number;
    xp: number;
    gems: Record<string, number>;
    materials: Record<string, number>;
    shovels: number;
  } | null>(null);
  
  const lastDigTime = useRef<number>(0);
  const stateRef = useRef(state);
  const saveTimerRef = useRef<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const rankTimerRef = useRef<number | null>(null);
  const pendingSyncStateRef = useRef<GameState | null>(null);
  const syncingRef = useRef(false);
  const retryDelayRef = useRef(1500);
  const authRef = useRef({
    ready: false,
    userId: '',
    sessionToken: '',
    username: '',
  });

  const refreshRank = async (targetUserId?: string) => {
    const uid = targetUserId || authRef.current.userId;
    if (!uid) return;
    try {
      const res = await fetch(buildApiUrl(`/api/leaderboard/${uid}/rank`));
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success) {
        setMyRank(typeof json.data?.rank === 'number' ? json.data.rank : null);
      }
    } catch (error) {
      console.error('refresh_rank_failed', error);
    }
  };

  const runSync = async () => {
    const auth = authRef.current;
    if (!auth.ready || !auth.userId || !pendingSyncStateRef.current || syncingRef.current) return;
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    const payload = pendingSyncStateRef.current;
    syncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const res = await fetch(buildApiUrl('/api/user/save'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': auth.sessionToken,
        },
        body: JSON.stringify({
          userId: auth.userId,
          username: auth.username,
          coins: payload.coins,
          gameState: payload,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'save_failed');
      }
      if (pendingSyncStateRef.current === payload) {
        pendingSyncStateRef.current = null;
      }
      retryDelayRef.current = 1500;
      setSyncStatus('synced');
      await refreshRank(auth.userId);
    } catch (error) {
      setSyncStatus(navigator.onLine ? 'error' : 'offline');
      console.error('sync_to_server_failed', error);
      if (!retryTimerRef.current) {
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          void runSync();
        }, retryDelayRef.current);
        retryDelayRef.current = Math.min(15000, retryDelayRef.current * 2);
      }
    } finally {
      syncingRef.current = false;
      if (pendingSyncStateRef.current) {
        void runSync();
      }
    }
  };

  const queueSync = (nextState: GameState) => {
    pendingSyncStateRef.current = nextState;
    void runSync();
  };

  const handleUpdateUsername = async (nextUsername: string) => {
    const auth = authRef.current;
    if (!auth.ready || !auth.userId) return false;
    const normalized = nextUsername.trim().slice(0, 24);
    if (!normalized) return false;
    try {
      const res = await fetch(buildApiUrl(`/api/user/${auth.userId}/name`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': auth.sessionToken,
        },
        body: JSON.stringify({ username: normalized }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) return false;
      authRef.current.username = normalized;
      setUsername(normalized);
      localStorage.setItem(STORAGE_KEYS.username, normalized);
      if (stateRef.current) {
        queueSync(stateRef.current);
      }
      return true;
    } catch (error) {
      console.error('update_username_failed', error);
      return false;
    }
  };

  useEffect(() => {
    let canceled = false;
    soundManager.init();
    const onOnline = () => {
      setSyncStatus('idle');
      void runSync();
    };
    const onOffline = () => {
      setSyncStatus('offline');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const initialize = async () => {
      let loadedState = loadState();

      try {
        const deviceId = ensureDeviceId();
        const username = localStorage.getItem(STORAGE_KEYS.username) || '';
        const authRes = await fetch(buildApiUrl('/api/auth/guest'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId,
            username,
          }),
        });

        if (authRes.ok) {
          const authJson = await authRes.json();
          if (authJson?.success && authJson?.data?.user?.userId) {
            const userId = authJson.data.user.userId as string;
            const sessionToken = authJson.data.sessionToken as string;
            const serverUsername = authJson.data.user.username as string;
            authRef.current = {
              ready: true,
              userId,
              sessionToken,
              username: serverUsername || username,
            };
            setUserId(userId);
            setUsername(serverUsername || username || '游客');
            localStorage.setItem(STORAGE_KEYS.userId, userId);
            localStorage.setItem(STORAGE_KEYS.sessionToken, sessionToken || '');
            localStorage.setItem(STORAGE_KEYS.username, serverUsername || username);
            loadedState = mergeRemoteState(loadedState, authJson.data.user.gameState);
            setMyRank(typeof authJson.data.user?.rank === 'number' ? authJson.data.user.rank : null);
            if (rankTimerRef.current) {
              window.clearInterval(rankTimerRef.current);
            }
            rankTimerRef.current = window.setInterval(() => {
              void refreshRank(userId);
            }, 30000);
          }
        }
      } catch (error) {
        console.error('auth_init_failed', error);
      }

      if (canceled) return;
    
      const now = Date.now();
      if (loadedState.lastLogoutTime) {
        const offlineTimeMs = now - loadedState.lastLogoutTime;
        const maxOfflineMs = 8 * 60 * 60 * 1000;
        const effectiveOfflineMs = Math.min(offlineTimeMs, maxOfflineMs);
        
        if (effectiveOfflineMs > 60000) {
          const house = HOUSES[loadedState.houseLevel] || HOUSES[0];
          const generatedShovels = Math.floor((effectiveOfflineMs / (1000 * 60 * 60)) * (house.shovelsPerHour || 0));
          
          let actualDigs = 0;
          let totalCoins = 0;
          let totalXp = 0;
          const earnedGems: Record<string, number> = {};
          const earnedMaterials: Record<string, number> = {};
          
          if (loadedState.minerCount > 0) {
            const tier = MINER_TIERS.find(t => t.level === loadedState.minerLevel) || MINER_TIERS[0];
            const houseSpeedBoost = HOUSES[loadedState.houseLevel]?.minerSpeedBoost || 0;
            const speedSkillLevel = loadedState.minerSkills?.['speed_boost'] || 0;
            const skillSpeedBoost = speedSkillLevel * 5;
            const totalSpeedBoost = houseSpeedBoost + skillSpeedBoost;
            
            const digsPerSecond = (loadedState.minerCount * (tier.digsPerMinute || 1) * (1 + totalSpeedBoost / 100)) / 60;
            actualDigs = Math.floor((effectiveOfflineMs / 1000) * digsPerSecond);
            
            if (actualDigs > 0) {
              let currentPrd = { ...loadedState.prdCounters } as Record<GemType, number>;
              let earnedGears: any[] = [];
              
              for (let i = 0; i < actualDigs; i++) {
                const { result, newPrdCounters } = performDig({ ...loadedState, prdCounters: currentPrd }, true);
                currentPrd = newPrdCounters;
                totalCoins += result.coinsEarned;
                totalXp += result.xpEarned;
                
                if (result.gearEarned) {
                  earnedGears.push(result.gearEarned);
                }

                result.gemsEarned.forEach(gem => {
                  earnedGems[gem] = (earnedGems[gem] || 0) + 1;
                });
                
                result.materialsEarned.forEach(mat => {
                  earnedMaterials[mat] = (earnedMaterials[mat] || 0) + 1;
                });
              }
              
              loadedState.coins += totalCoins;
              loadedState.totalCoinsEarned += totalCoins;
              loadedState.xp += totalXp;
              loadedState.totalDigs = (loadedState.totalDigs || 0) + actualDigs;
              const level = getLevelFromXp(loadedState.xp);
              loadedState.level = level;
              loadedState.prdCounters = currentPrd;
              
              if (earnedGears.length > 0) {
                loadedState.inventoryGear = [...(loadedState.inventoryGear || []), ...earnedGears];
              }
              
              const { newDurability, newEquipped, newUnlocked } = handleDurability(loadedState, actualDigs);
              loadedState.shovelDurability = newDurability;
              loadedState.equippedShovel = newEquipped;
              loadedState.unlockedShovels = newUnlocked;
              
              Object.entries(earnedGems).forEach(([gem, count]) => {
                loadedState.inventory[gem as GemType] = (loadedState.inventory[gem as GemType] || 0) + count;
                if (!loadedState.discoveredGems.includes(gem as GemType)) {
                  loadedState.discoveredGems.push(gem as GemType);
                }
              });
              
              Object.entries(earnedMaterials).forEach(([mat, count]) => {
                loadedState.materials[mat as MaterialType] = (loadedState.materials[mat as MaterialType] || 0) + count;
              });
            }
          }
          
          loadedState.shovels += generatedShovels;
          
          if (actualDigs > 0 || generatedShovels > 0) {
            setOfflineReward({
              timeMs: effectiveOfflineMs,
              digs: actualDigs,
              coins: totalCoins,
              xp: totalXp,
              gems: earnedGems,
              materials: earnedMaterials,
              shovels: generatedShovels
            });
          }
        }
      }

      loadedState.lastLogoutTime = now;
      setState(loadedState);
      const today = new Date().toISOString().split('T')[0];
      if (loadedState.lastLoginDate !== today) {
        setShowDailyLogin(true);
      }
      if (authRef.current.ready) {
        queueSync(loadedState);
        void refreshRank(authRef.current.userId);
      }
    };

    void initialize();
    return () => {
      canceled = true;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
      if (rankTimerRef.current) {
        window.clearInterval(rankTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state);
      stateRef.current = state;
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        queueSync(state);
      }, 1200);
    }
  }, [state]);

  // Auto digging interval
  useEffect(() => {
    if (!state || state.minerCount === 0) return;
    
    const tier = MINER_TIERS.find(t => t.level === state.minerLevel) || MINER_TIERS[0];
    const houseSpeedBoost = HOUSES[state.houseLevel]?.minerSpeedBoost || 0;
    const speedSkillLevel = state.minerSkills?.['speed_boost'] || 0;
    const skillSpeedBoost = speedSkillLevel * 5;
    const totalSpeedBoost = houseSpeedBoost + skillSpeedBoost;
    
    const digsPerSecond = (state.minerCount * (tier.digsPerMinute || 1) * (1 + totalSpeedBoost / 100)) / 60;
    
    let accumulatedDigs = 0;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev) return prev;
        
        accumulatedDigs += digsPerSecond;
        const actualDigs = Math.floor(accumulatedDigs);
        
        if (actualDigs > 0) {
          accumulatedDigs -= actualDigs;
          
          let tempState = { ...prev };
          let totalCoins = 0;
          let totalXp = 0;
          const newInventory = { ...tempState.inventory };
          const newMaterials = { ...tempState.materials };
          const newDiscovered = [...tempState.discoveredGems];
          const newInventoryGear = [...(tempState.inventoryGear || [])];
          let currentPrd = { ...tempState.prdCounters } as Record<GemType, number>;

          for (let i = 0; i < actualDigs; i++) {
            const { result, newPrdCounters } = performDig({ ...tempState, prdCounters: currentPrd }, true);
            currentPrd = newPrdCounters;
            totalCoins += result.coinsEarned;
            totalXp += result.xpEarned;
            
            if (result.gearEarned) {
              newInventoryGear.push(result.gearEarned);
            }

            result.gemsEarned.forEach(gem => {
              newInventory[gem] = (newInventory[gem] || 0) + 1;
              if (!newDiscovered.includes(gem)) newDiscovered.push(gem);
            });
            
            result.materialsEarned.forEach(mat => {
              newMaterials[mat] = (newMaterials[mat] || 0) + 1;
            });
          }

          const level = getLevelFromXp(tempState.xp + totalXp);
          
          const { newDurability, newEquipped, newUnlocked } = handleDurability(tempState, actualDigs);

          return {
            ...tempState,
            coins: tempState.coins + totalCoins,
            totalCoinsEarned: tempState.totalCoinsEarned + totalCoins,
            xp: tempState.xp + totalXp,
            totalDigs: (tempState.totalDigs || 0) + actualDigs,
            level,
            inventory: newInventory,
            materials: newMaterials,
            discoveredGems: newDiscovered,
            prdCounters: currentPrd,
            shovelDurability: newDurability,
            equippedShovel: newEquipped,
            unlockedShovels: newUnlocked,
            inventoryGear: newInventoryGear
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.minerCount, state?.minerLevel]);

  // Online shovel generation interval
  useEffect(() => {
    if (!state) return;
    const house = HOUSES[state.houseLevel] || HOUSES[0];
    if (!house.shovelsPerHour) return;

    const shovelsPerSecond = house.shovelsPerHour / 3600;
    let accumulatedShovels = 0;

    const interval = setInterval(() => {
      accumulatedShovels += shovelsPerSecond;
      const shovelsToAdd = Math.floor(accumulatedShovels);
      
      if (shovelsToAdd > 0) {
        accumulatedShovels -= shovelsToAdd;
        setState(prev => prev ? { ...prev, shovels: prev.shovels + shovelsToAdd } : prev);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.houseLevel]);

  const handleClaimOfflineReward = (multiplier: number) => {
    if (!offlineReward) return;
    
    soundManager.playCoin();
    
    if (multiplier > 1) {
      setState(prev => {
        if (!prev) return prev;
        
        const newInventory = { ...prev.inventory };
        const newMaterials = { ...prev.materials };
        
        Object.entries(offlineReward.gems).forEach(([gem, count]) => {
          newInventory[gem as GemType] = (newInventory[gem as GemType] || 0) + count;
        });
        Object.entries(offlineReward.materials).forEach(([mat, count]) => {
          newMaterials[mat as MaterialType] = (newMaterials[mat as MaterialType] || 0) + count;
        });
        
        return {
          ...prev,
          coins: prev.coins + offlineReward.coins,
          totalCoinsEarned: prev.totalCoinsEarned + offlineReward.coins,
          xp: prev.xp + offlineReward.xp,
          shovels: prev.shovels + offlineReward.shovels,
          inventory: newInventory,
          materials: newMaterials
        };
      });
    }
    
    setOfflineReward(null);
  };

  const handleToggleAutoDig = () => {
    setState(prev => prev ? { ...prev, isAutoDigging: !prev.isAutoDigging } : prev);
  };

  const handleClaimDailyLogin = () => {
    if (!state) return;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newConsecutiveLogins = state.consecutiveLogins;
    if (state.lastLoginDate === yesterday) {
      newConsecutiveLogins += 1;
    } else if (state.lastLoginDate !== today) {
      newConsecutiveLogins = 1;
    }
    
    // Cap at 7 for reward calculation
    const rewardDay = Math.min(newConsecutiveLogins, 7);
    
    const REWARDS = [
      { day: 1, coins: 100, shovels: 10 },
      { day: 2, coins: 200, shovels: 20 },
      { day: 3, coins: 500, shovels: 30 },
      { day: 4, coins: 1000, shovels: 40 },
      { day: 5, coins: 2000, shovels: 50 },
      { day: 6, coins: 5000, shovels: 80 },
      { day: 7, coins: 10000, shovels: 100 },
    ];
    
    const reward = REWARDS[rewardDay - 1];
    
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins + reward.coins,
        totalCoinsEarned: prev.totalCoinsEarned + reward.coins,
        shovels: prev.shovels + reward.shovels,
        lastLoginDate: today,
        consecutiveLogins: newConsecutiveLogins
      };
    });
    
    setShowDailyLogin(false);
  };

  const handleStartDigging = () => {
    const currentState = stateRef.current;
    if (!currentState) return;

    // Check if current mine has an undefeated boss
    const currentMineDef = MINES.find(m => m.id === currentState.currentMine);
    if (currentMineDef && currentMineDef.bossPower) {
      if (!currentState.defeatedBosses || !currentState.defeatedBosses.includes(currentMineDef.id)) {
        alert(`你需要先在【矿洞】界面击败【${currentMineDef.bossName}】才能在这里挖宝！`);
        return;
      }
    }

    const now = Date.now();
    // Rate limit: 1.5 seconds between digs
    if (isDigging || currentState.shovels <= 0 || now - lastDigTime.current < 1500) return;
    
    soundManager.init();
    soundManager.playDig();
    setIsDigging(true);
    lastDigTime.current = now;

    setTimeout(() => {
      const latestState = stateRef.current;
      if (!latestState) return;

      const { result, newPrdCounters } = performDig(latestState);
      
      let newCoins = latestState.coins + result.coinsEarned;
      let newTotalCoins = latestState.totalCoinsEarned + result.coinsEarned;
      const newInventory = { ...latestState.inventory };
      const newDiscoveredGems = [...latestState.discoveredGems];

      if (result.gemsEarned.includes('七彩宝石') || result.gemsEarned.some(g => ['蓝宝石', '绿宝石', '七彩铲子碎片'].includes(g))) {
        soundManager.playRareGem();
      } else if (result.gemsEarned.length > 0) {
        soundManager.playGem();
      } else if (result.coinsEarned > 0) {
        soundManager.playCoin();
      }

      result.gemsEarned.forEach(gem => {
        newInventory[gem] = (newInventory[gem] || 0) + 1;
        if (!newDiscoveredGems.includes(gem)) {
          newDiscoveredGems.push(gem);
        }
        if (GEM_VALUES[gem]) {
          newCoins += GEM_VALUES[gem]!;
          newTotalCoins += GEM_VALUES[gem]!;
        }
      });

      const newLevel = getLevelFromXp(latestState.xp + result.xpEarned);
      const didLevelUp = newLevel > latestState.level;

      let newShovels = latestState.shovels - 1;
      if (result.shovelsEarned) {
        newShovels += result.shovelsEarned;
      }

      const newMaterials = { ...latestState.materials };
      result.materialsEarned.forEach(mat => {
        newMaterials[mat] = (newMaterials[mat] || 0) + 1;
      });
      
      const newInventoryGear = [...(latestState.inventoryGear || [])];
      if (result.gearEarned) {
        newInventoryGear.push(result.gearEarned);
      }
      
      const { newDurability, newEquipped, newUnlocked } = handleDurability(latestState, 1);

      setState(prev => ({
        ...prev!,
        coins: newCoins,
        totalCoinsEarned: newTotalCoins,
        level: newLevel,
        xp: latestState.xp + result.xpEarned,
        totalDigs: (latestState.totalDigs || 0) + 1,
        shovels: newShovels,
        inventory: newInventory,
        materials: newMaterials,
        discoveredGems: newDiscoveredGems,
        prdCounters: newPrdCounters,
        shovelDurability: newDurability,
        equippedShovel: newEquipped,
        unlockedShovels: newUnlocked,
        inventoryGear: newInventoryGear
      }));

      if (didLevelUp) {
        soundManager.playLevelUp();
        setLevelUpMessage(`升级成功！当前等级 Lv.${newLevel}`);
        setTimeout(() => setLevelUpMessage(null), 3000);
      }

      setIsDigging(false);
      setDigResult(result);
    }, 1000); // 1 second animation
  };

  useEffect(() => {
    if (state?.isAutoDigging && state.shovels > 0 && !isDigging) {
      const timer = setTimeout(() => {
        handleStartDigging();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (state?.isAutoDigging && state?.shovels <= 0) {
      setState(prev => prev ? { ...prev, isAutoDigging: false } : prev);
    }
  }, [state?.isAutoDigging, state?.shovels, isDigging]);

  const handleCloseReward = () => {
    setDigResult(null);
  };

  const handleWatchAd = () => {
    const confirmAd = window.confirm('模拟观看微信激励视频广告？\n点击确定恢复 10 次挖宝次数。');
    if (confirmAd) {
      setState(prev => ({
        ...prev!,
        shovels: prev!.shovels + 10,
      }));
    }
  };

  const handleAddShovels = () => {
    setState(prev => ({
      ...prev!,
      shovels: prev!.shovels + 100,
    }));
  };

  const toggleSound = () => {
    soundManager.init();
    setSoundEnabled(soundManager.toggle());
  };

  if (!state) return null;

  const currentSceneDef = SCENES.find(s => s.id === state.currentScene) || SCENES[0];
  const house = HOUSES[state.houseLevel] || HOUSES[0];
  const currentGemsCount = Object.entries(state.inventory).reduce((sum, [k, v]) => {
    if (k.includes('碎片')) return sum;
    return sum + (v as number);
  }, 0);

  const completeTutorial = () => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, tutorialCompleted: true };
    });
  };

  return (
    <div 
      className="h-screen bg-sky-300 overflow-hidden relative flex flex-col transition-all duration-1000 font-sans text-slate-800"
    >
      {/* Tutorial Overlay */}
      {!state.tutorialCompleted && <Tutorial onComplete={completeTutorial} />}

      {/* Dynamic Background based on active tab */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${activeTab === 'home' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-400" />
          {/* Clouds */}
          <div className="absolute top-10 left-10 w-32 h-12 bg-white/80 rounded-full blur-sm" />
          <div className="absolute top-20 right-20 w-40 h-16 bg-white/80 rounded-full blur-sm" />
          <div className="absolute top-40 left-1/3 w-24 h-10 bg-white/60 rounded-full blur-sm" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ${activeTab !== 'home' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-orange-100" />
        </div>
      </div>

      {/* Top Info Bar */}
      <div className="relative z-20 px-4 pt-6 pb-2 flex justify-between items-center bg-white/40 backdrop-blur-md shadow-sm border-b border-white/50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-white font-black px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
            <span className="text-sm">Lv.</span>
            <span className="text-lg">{state.level}</span>
          </div>
          <div className="bg-white/80 text-amber-500 font-black px-3 py-1 rounded-full shadow-sm border-2 border-amber-200 flex items-center gap-1">
            <Coins size={18} />
            <span>{state.coins}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/80 text-emerald-500 font-black px-3 py-1 rounded-full shadow-sm border-2 border-emerald-200 flex items-center gap-1">
            <Pickaxe size={18} />
            <span>{state.shovels}</span>
          </div>
          <div className="bg-white/80 text-indigo-500 font-black px-3 py-1 rounded-full shadow-sm border-2 border-indigo-200 flex items-center gap-1">
            <Package size={18} />
            <span>{currentGemsCount}/{house.capacity}</span>
          </div>
          <button 
            onClick={toggleSound}
            className="p-1.5 bg-white/80 text-slate-500 rounded-full shadow-sm border-2 border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Home 
                state={state} 
                onStartDigging={handleStartDigging} 
                onWatchAd={handleWatchAd}
                isDigging={isDigging}
                digResult={digResult}
                onCloseReward={handleCloseReward}
                onToggleAutoDig={handleToggleAutoDig}
                onAddShovels={handleAddShovels}
              />
            </motion.div>
          )}
          {activeTab === 'equipment' && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Equipment state={state} setState={setState} onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Shop state={state} setState={setState} />
            </motion.div>
          )}
          {activeTab === 'backpack' && (
            <motion.div
              key="backpack"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Backpack state={state} setState={setState} />
            </motion.div>
          )}
          {activeTab === 'house' && (
            <motion.div
              key="house"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <House state={state} setState={setState} setActiveTab={setActiveTab} />
            </motion.div>
          )}
          {activeTab === 'mine' && (
            <motion.div
              key="mine"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Mine state={state} setState={setState} setActiveTab={setActiveTab} />
            </motion.div>
          )}
          {activeTab === 'museum' && (
            <motion.div
              key="museum"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Museum state={state} setState={setState} initialTab="gems" />
            </motion.div>
          )}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Museum state={state} setState={setState} initialTab="achievements" />
            </motion.div>
          )}
          {activeTab === 'me' && (
            <motion.div
              key="me"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Me
                state={state}
                setState={setState}
                username={username}
                userId={userId}
                myRank={myRank}
                syncStatus={syncStatus}
                onUpdateUsername={handleUpdateUsername}
              />
            </motion.div>
          )}
          {activeTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Quests state={state} setState={setState} />
            </motion.div>
          )}
          {activeTab === 'miners' && (
            <motion.div
              key="miners"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-full"
            >
              <Miners state={state} setState={setState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - Floating Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/90 backdrop-blur-xl border-2 border-white/50 rounded-3xl flex justify-start items-center p-2 z-40 shadow-xl shadow-sky-900/20 overflow-x-auto hide-scrollbar gap-1">
        {[
          { id: 'home', icon: Pickaxe, label: '挖宝', color: 'text-amber-500', bg: 'bg-amber-100' },
          { id: 'equipment', icon: Shield, label: '装备', color: 'text-rose-500', bg: 'bg-rose-100' },
          { id: 'house', icon: HomeIcon, label: '房屋', color: 'text-indigo-500', bg: 'bg-indigo-100' },
          { id: 'mine', icon: Mountain, label: '矿洞', color: 'text-emerald-500', bg: 'bg-emerald-100' },
          { id: 'quests', icon: Gift, label: '任务', color: 'text-amber-500', bg: 'bg-amber-100' },
          { id: 'me', icon: User, label: '我', color: 'text-indigo-500', bg: 'bg-indigo-100' },
          { id: 'shop', icon: Store, label: '商店', color: 'text-sky-500', bg: 'bg-sky-100' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => {
                soundManager.init();
                soundManager.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`relative flex flex-col items-center justify-center flex-shrink-0 w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? tab.color : 'text-slate-400 hover:text-slate-200'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 ${tab.bg} rounded-2xl`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative z-10 flex flex-col items-center"
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* Level Up Toast */}
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-amber-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"
          >
            🌟 {levelUpMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDailyLogin && state && (
          <DailyLoginModal
            key="daily-login"
            consecutiveLogins={state.lastLoginDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? state.consecutiveLogins + 1 : 1}
            onClaim={handleClaimDailyLogin}
            onClose={() => setShowDailyLogin(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {offlineReward && (
          <OfflineRewardModal
            key="offline-reward"
            reward={offlineReward}
            onClaim={handleClaimOfflineReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
