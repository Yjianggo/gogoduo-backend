/**
 * 数据库初始化脚本
 * 运行此脚本将创建必要的数据库集合并插入示例题目
 * 
 * 使用方法：
 * 1. 在微信开发者工具中打开项目
 * 2. 打开云开发控制台
 * 3. 在"数据库"页面创建以下集合：
 *    - exam_users (考生信息)
 *    - exam_sessions (考试会话)
 *    - exam_records (考试记录)
 *    - questions (题目)
 * 4. 使用管理员权限运行此脚本，或手动导入以下数据到 questions 集合
 */

const defaultQuestions = [
  {
    content: '1 + 1 = ?',
    optionA: '1',
    optionB: '2',
    optionC: '3',
    optionD: '4',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '中国的首都是？',
    optionA: '上海',
    optionB: '北京',
    optionC: '广州',
    optionD: '深圳',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '太阳从哪边升起？',
    optionA: '西边',
    optionB: '东边',
    optionC: '南边',
    optionD: '北边',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '一年有多少个月？',
    optionA: '10个月',
    optionB: '11个月',
    optionC: '12个月',
    optionD: '13个月',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '一周有多少天？',
    optionA: '5天',
    optionB: '6天',
    optionC: '7天',
    optionD: '8天',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '2 × 3 = ?',
    optionA: '5',
    optionB: '6',
    optionC: '8',
    optionD: '9',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '水在多少度会沸腾？',
    optionA: '50度',
    optionB: '75度',
    optionC: '100度',
    optionD: '150度',
    correctAnswer: 'C',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '一年有几个季节？',
    optionA: '2个',
    optionB: '3个',
    optionC: '4个',
    optionD: '5个',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '世界上最长的河流是？',
    optionA: '长江',
    optionB: '黄河',
    optionC: '尼罗河',
    optionD: '亚马逊河',
    correctAnswer: 'C',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '人体最大的器官是？',
    optionA: '心脏',
    optionB: '肝脏',
    optionC: '皮肤',
    optionD: '肺',
    correctAnswer: 'C',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '5 + 5 = ?',
    optionA: '9',
    optionB: '10',
    optionC: '11',
    optionD: '12',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '10 - 3 = ?',
    optionA: '5',
    optionB: '6',
    optionC: '7',
    optionD: '8',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '地球是什么形状？',
    optionA: '平的',
    optionB: '方的',
    optionC: '圆的',
    optionD: '球形',
    correctAnswer: 'D',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '一个月通常有多少天？',
    optionA: '28-31天',
    optionB: '20-25天',
    optionC: '35-40天',
    optionD: '15-20天',
    correctAnswer: 'A',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '光速快还是声速快？',
    optionA: '声速',
    optionB: '光速',
    optionC: '一样快',
    optionD: '无法比较',
    correctAnswer: 'B',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '人体有多少块骨头？',
    optionA: '106块',
    optionB: '206块',
    optionC: '306块',
    optionD: '406块',
    correctAnswer: 'B',
    difficulty: 3,
    createTime: new Date()
  },
  {
    content: '3 × 4 = ?',
    optionA: '10',
    optionB: '11',
    optionC: '12',
    optionD: '13',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '世界上使用人数最多的语言是？',
    optionA: '英语',
    optionB: '中文',
    optionC: '西班牙语',
    optionD: '法语',
    correctAnswer: 'B',
    difficulty: 2,
    createTime: new Date()
  },
  {
    content: '20 ÷ 4 = ?',
    optionA: '4',
    optionB: '5',
    optionC: '6',
    optionD: '7',
    correctAnswer: 'B',
    difficulty: 1,
    createTime: new Date()
  },
  {
    content: '人体血液是什么颜色？',
    optionA: '蓝色',
    optionB: '绿色',
    optionC: '红色',
    optionD: '黄色',
    correctAnswer: 'C',
    difficulty: 1,
    createTime: new Date()
  }
];

console.log('题目数据准备完成，共', defaultQuestions.length, '道题');
console.log('请在微信开发者工具中手动导入到 questions 集合');
