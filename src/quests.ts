import { Quest } from './types';

export const QUESTS: Quest[] = [
  {
    id: 'q1',
    title: '初出茅庐',
    description: '进行 10 次挖宝',
    type: 'dig',
    target: 10,
    rewardCoins: 500,
    rewardXp: 100,
    rewardShovels: 5
  },
  {
    id: 'q2',
    title: '第一桶金',
    description: '累计获得 1,000 金币',
    type: 'collect_coins',
    target: 1000,
    rewardCoins: 1000,
    rewardXp: 200
  },
  {
    id: 'q3',
    title: '招兵买马',
    description: '雇佣 1 名矿工',
    type: 'hire_miner',
    target: 1,
    rewardCoins: 2000,
    rewardShovels: 10,
    rewardXp: 300
  },
  {
    id: 'q4',
    title: '安居乐业',
    description: '将房屋升级到 1 级',
    type: 'upgrade_house',
    target: 1,
    rewardCoins: 5000,
    rewardGems: { '白宝石': 5 }
  },
  {
    id: 'q5',
    title: '清理库存',
    description: '进行 1 次满仓兑换',
    type: 'exchange_warehouse',
    target: 1,
    rewardCoins: 3000,
    rewardShovels: 20
  },
  {
    id: 'q6',
    title: '效率至上',
    description: '在商店购买 1 次限时增益',
    type: 'buy_buff',
    target: 1,
    rewardCoins: 2000,
    rewardXp: 500
  },
  {
    id: 'q7',
    title: '鸟枪换炮',
    description: '装备一把新铲子（如银铲子）',
    type: 'equip_shovel',
    target: 1,
    rewardCoins: 10000,
    rewardGems: { '蓝宝石': 1 }
  },
  {
    id: 'q8',
    title: '挖宝达人',
    description: '进行 100 次挖宝',
    type: 'dig',
    target: 100,
    rewardCoins: 5000,
    rewardShovels: 50,
    rewardXp: 1000
  },
  {
    id: 'q9',
    title: '百万富翁',
    description: '累计获得 1,000,000 金币',
    type: 'collect_coins',
    target: 1000000,
    rewardCoins: 100000,
    rewardGems: { '七彩宝石': 1 }
  },
  {
    id: 'q10',
    title: '挖矿狂人',
    description: '进行 1,000 次挖宝',
    type: 'dig',
    target: 1000,
    rewardCoins: 50000,
    rewardShovels: 200,
    rewardXp: 5000
  },
  {
    id: 'q11',
    title: '千万富翁',
    description: '累计获得 10,000,000 金币',
    type: 'collect_coins',
    target: 10000000,
    rewardCoins: 1000000,
    rewardGems: { '七彩宝石': 5 }
  },
  {
    id: 'q12',
    title: '矿业帝国',
    description: '雇佣 10 名矿工',
    type: 'hire_miner',
    target: 10,
    rewardCoins: 200000,
    rewardShovels: 500,
    rewardXp: 10000
  },
  {
    id: 'q13',
    title: '豪宅主人',
    description: '将房屋升级到 5 级 (庄园)',
    type: 'upgrade_house',
    target: 5,
    rewardCoins: 500000,
    rewardGems: { '黑宝石': 50, '白宝石': 10 }
  },
  {
    id: 'q14',
    title: '挖宝宗师',
    description: '进行 10,000 次挖宝',
    type: 'dig',
    target: 10000,
    rewardCoins: 1000000,
    rewardShovels: 1000,
    rewardXp: 50000
  }
];
