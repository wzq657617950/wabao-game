import { Quest } from './types';

const BASE_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: '初出茅庐',
    description: '进行 10 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 1,
    target: 10,
    rewardCoins: 300,
    rewardXp: 30,
    rewardShovels: 3
  },
  {
    id: 'q8',
    title: '熟练上手',
    description: '进行 50 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 2,
    target: 50,
    rewardCoins: 800,
    rewardShovels: 6,
    rewardXp: 80
  },
  {
    id: 'q10',
    title: '锋芒初露',
    description: '进攻 100 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 3,
    target: 100,
    rewardCoins: 1200,
    rewardShovels: 8,
    rewardXp: 120
  },
  {
    id: 'q14',
    title: '持之以恒',
    description: '进行 300 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 4,
    target: 300,
    rewardCoins: 2500,
    rewardShovels: 12,
    rewardXp: 220
  },
  {
    id: 'q15',
    title: '挖宝达人',
    description: '进行 1,000 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 5,
    target: 1000,
    rewardCoins: 6000,
    rewardShovels: 20,
    rewardXp: 500
  },
  {
    id: 'q16',
    title: '挖矿狂人',
    description: '进行 3,000 次挖宝',
    type: 'dig',
    chainId: 'dig',
    chainStep: 6,
    target: 3000,
    rewardCoins: 15000,
    rewardShovels: 40,
    rewardXp: 1200
  },
  {
    id: 'q2',
    title: '第一桶金',
    description: '累计获得 1,000 金币',
    type: 'collect_coins',
    chainId: 'coins',
    chainStep: 1,
    target: 1000,
    rewardCoins: 400,
    rewardXp: 40
  },
  {
    id: 'q9',
    title: '小有积蓄',
    description: '累计获得 10,000 金币',
    type: 'collect_coins',
    chainId: 'coins',
    chainStep: 2,
    target: 10000,
    rewardCoins: 1200,
    rewardXp: 120
  },
  {
    id: 'q11',
    title: '财富进阶',
    description: '累计获得 50,000 金币',
    type: 'collect_coins',
    chainId: 'coins',
    chainStep: 3,
    target: 50000,
    rewardCoins: 2500,
    rewardXp: 220
  },
  {
    id: 'q17',
    title: '家财渐丰',
    description: '累计获得 200,000 金币',
    type: 'collect_coins',
    chainId: 'coins',
    chainStep: 4,
    target: 200000,
    rewardCoins: 7000,
    rewardXp: 500
  },
  {
    id: 'q18',
    title: '财富新贵',
    description: '累计获得 1,000,000 金币',
    type: 'collect_coins',
    chainId: 'coins',
    chainStep: 5,
    target: 1000000,
    rewardCoins: 20000,
    rewardShovels: 30,
    rewardXp: 1200
  },
  {
    id: 'q3',
    title: '招兵买马',
    description: '雇佣 1 名矿工',
    type: 'hire_miner',
    chainId: 'miner',
    chainStep: 1,
    target: 1,
    rewardCoins: 600,
    rewardShovels: 3,
    rewardXp: 60
  },
  {
    id: 'q12',
    title: '矿队扩编',
    description: '雇佣 3 名矿工',
    type: 'hire_miner',
    chainId: 'miner',
    chainStep: 2,
    target: 3,
    rewardCoins: 1500,
    rewardShovels: 6,
    rewardXp: 150
  },
  {
    id: 'q19',
    title: '矿队精锐',
    description: '雇佣 5 名矿工',
    type: 'hire_miner',
    chainId: 'miner',
    chainStep: 3,
    target: 5,
    rewardCoins: 3000,
    rewardXp: 300
  },
  {
    id: 'q20',
    title: '矿业组织',
    description: '雇佣 10 名矿工',
    type: 'hire_miner',
    chainId: 'miner',
    chainStep: 4,
    target: 10,
    rewardCoins: 7000,
    rewardXp: 650
  },
  {
    id: 'q21',
    title: '矿业帝国',
    description: '雇佣 20 名矿工',
    type: 'hire_miner',
    chainId: 'miner',
    chainStep: 5,
    target: 20,
    rewardCoins: 15000,
    rewardShovels: 20,
    rewardXp: 1300
  },
  {
    id: 'q4',
    title: '安居乐业',
    description: '将房屋升级到 1 级',
    type: 'upgrade_house',
    chainId: 'house',
    chainStep: 1,
    target: 1,
    rewardCoins: 1200,
    rewardGems: { '白宝石': 2 }
  },
  {
    id: 'q13',
    title: '舒适新居',
    description: '将房屋升级到 2 级',
    type: 'upgrade_house',
    chainId: 'house',
    chainStep: 2,
    target: 2,
    rewardCoins: 2500,
    rewardGems: { '白宝石': 3 }
  },
  {
    id: 'q22',
    title: '小有成就',
    description: '将房屋升级到 3 级',
    type: 'upgrade_house',
    chainId: 'house',
    chainStep: 3,
    target: 3,
    rewardCoins: 4500,
    rewardXp: 300
  },
  {
    id: 'q23',
    title: '豪宅主人',
    description: '将房屋升级到 5 级',
    type: 'upgrade_house',
    chainId: 'house',
    chainStep: 4,
    target: 5,
    rewardCoins: 9000,
    rewardXp: 700
  },
  {
    id: 'q24',
    title: '城堡领主',
    description: '将房屋升级到 7 级',
    type: 'upgrade_house',
    chainId: 'house',
    chainStep: 5,
    target: 7,
    rewardCoins: 18000,
    rewardXp: 1400
  },
  {
    id: 'q5',
    title: '清理库存',
    description: '进行 1 次满仓兑换',
    type: 'exchange_warehouse',
    chainId: 'exchange',
    chainStep: 1,
    target: 1,
    rewardCoins: 700,
    rewardShovels: 4
  },
  {
    id: 'q25',
    title: '仓库调度',
    description: '进行 5 次满仓兑换',
    type: 'exchange_warehouse',
    chainId: 'exchange',
    chainStep: 2,
    target: 5,
    rewardCoins: 2000,
    rewardShovels: 8
  },
  {
    id: 'q26',
    title: '清仓高手',
    description: '进行 20 次满仓兑换',
    type: 'exchange_warehouse',
    chainId: 'exchange',
    chainStep: 3,
    target: 20,
    rewardCoins: 6000,
    rewardXp: 500
  },
  {
    id: 'q6',
    title: '效率至上',
    description: '在商店购买 1 次限时增益',
    type: 'buy_buff',
    chainId: 'buff',
    chainStep: 1,
    target: 1,
    rewardCoins: 600,
    rewardXp: 60
  },
  {
    id: 'q27',
    title: '状态拉满',
    description: '在商店购买 3 次限时增益',
    type: 'buy_buff',
    chainId: 'buff',
    chainStep: 2,
    target: 3,
    rewardCoins: 1800,
    rewardXp: 180
  },
  {
    id: 'q28',
    title: '增益专家',
    description: '在商店购买 10 次限时增益',
    type: 'buy_buff',
    chainId: 'buff',
    chainStep: 3,
    target: 10,
    rewardCoins: 5000,
    rewardXp: 500
  },
  {
    id: 'q7',
    title: '鸟枪换炮',
    description: '装备 1 次新铲子',
    type: 'equip_shovel',
    chainId: 'shovel',
    chainStep: 1,
    target: 1,
    rewardCoins: 1000,
    rewardXp: 100
  },
  {
    id: 'q29',
    title: '装备进阶',
    description: '装备 3 次新铲子',
    type: 'equip_shovel',
    chainId: 'shovel',
    chainStep: 2,
    target: 3,
    rewardCoins: 2600,
    rewardXp: 260
  }
];

const QUEST_REWARD_SCALE = 0.55;
const QUEST_GEM_REWARD_SCALE = 0.5;

export const QUESTS: Quest[] = BASE_QUESTS.map((quest) => {
  const scaledGems = quest.rewardGems
    ? Object.fromEntries(
        Object.entries(quest.rewardGems).map(([gem, count]) => [
          gem,
          Math.max(1, Math.floor((count || 0) * QUEST_GEM_REWARD_SCALE))
        ])
      )
    : undefined;

  return {
    ...quest,
    rewardCoins: quest.rewardCoins ? Math.max(100, Math.floor(quest.rewardCoins * QUEST_REWARD_SCALE)) : undefined,
    rewardShovels: quest.rewardShovels ? Math.max(1, Math.floor(quest.rewardShovels * QUEST_REWARD_SCALE)) : undefined,
    rewardXp: quest.rewardXp ? Math.max(10, Math.floor(quest.rewardXp * QUEST_REWARD_SCALE)) : undefined,
    rewardGems: scaledGems as Quest['rewardGems'],
  };
});
