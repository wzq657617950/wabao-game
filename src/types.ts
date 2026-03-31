export type GemType =
  | '七彩宝石'
  | '蓝宝石'
  | '红宝石'
  | '绿宝石'
  | '白宝石'
  | '黑宝石'
  | '银铲子碎片'
  | '金铲子碎片'
  | '七彩铲子碎片';

export type MaterialType = '木材' | '砖块' | '水泥' | '玻璃' | '钢材';
export type MineType = '普通矿洞' | '中级矿洞' | '高级矿洞' | '传奇矿洞' | '神话矿洞' | '虚空矿洞' | '混沌矿洞';

export type BuffType = 'coin_boost' | 'gem_boost';
export type ShovelType = '普通铁铲子' | '银铲子' | '金铲子' | '七彩铲子';

export interface Buff {
  type: BuffType;
  expiresAt: number;
}

export type GearSlot = 'weapon' | 'helmet' | 'armor' | 'boots' | 'accessory';
export type GearRarity = 'C' | 'B' | 'A' | 'R' | 'SR' | 'SSR' | 'XR' | 'XXR' | 'MAX';

export interface UniqueGear {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  level: number;
  power: number;
  baseStats: {
    attack: number;
    defense: number;
    hp: number;
  };
  subStats: {
    critRate?: number;
    critDamage?: number;
    dodgeRate?: number;
    counterRate?: number;
    vampRate?: number;
    plunderBonus?: number;
    digSpeed?: number;
  };
  icon?: string;
}

export interface Opponent {
  id: string;
  name: string;
  description: string;
  power: number;
  rewardCoins: number;
  rewardGems: GemType[];
  rewardMaterials?: MaterialType[];
  costCoins: number;
}

export type QuestType = 'dig' | 'collect_coins' | 'hire_miner' | 'upgrade_house' | 'exchange_warehouse' | 'buy_buff' | 'equip_shovel';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  chainId?: string;
  chainStep?: number;
  target: number;
  rewardCoins?: number;
  rewardShovels?: number;
  rewardXp?: number;
  rewardGems?: Partial<Record<GemType, number>>;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  houseLevel: number;
  lastGiftTime: number;
  avatar: string;
}

export interface GameState {
  coins: number;
  totalCoinsEarned: number;
  totalDigs: number;
  level: number;
  xp: number;
  shovels: number;
  lastResetDate: string;
  inventory: Record<GemType, number>;
  materials: Record<MaterialType, number>;
  houseLevel: number;
  currentMine: MineType;
  unlockedMines: MineType[];
  equippedSkin: string;
  unlockedSkins: string[];
  equippedShovel: ShovelType;
  unlockedShovels: ShovelType[];
  activeBuffs: Buff[];
  prdCounters: Record<string, number>;
  pityCounters?: Record<string, number>;
  consecutiveDigs?: number;
  isAutoDigging: boolean;
  ownedScenes: string[];
  currentScene: string;
  unlockedAchievements: string[];
  discoveredGems: GemType[];
  lastLoginDate: string;
  consecutiveLogins: number;
  minerCount: number;
  minerLevel: number;
  lastLogoutTime: number;
  minerSkills: Record<string, number>;
  inventoryGear: UniqueGear[];
  equippedGear: Partial<Record<GearSlot, UniqueGear>>;
  questsProgress: Record<string, number>;
  completedQuests: string[];
  customSkins?: Record<string, string>;
  customGems?: Record<string, string>;
  customHouses?: Record<number, string>;
  shovelDurability?: Record<string, number>;
  friends?: Friend[];
  tutorialCompleted?: boolean;
  defeatedBosses?: string[]; // 记录已击败的矿洞Boss
}

export interface DigResult {
  coinsEarned: number;
  gemsEarned: GemType[];
  materialsEarned: MaterialType[];
  shovelsEarned?: number;
  xpEarned: number;
  isCrit?: boolean;
  almostMythic?: boolean;
  gearEarned?: UniqueGear;
}
