// miniprogram/pages/exam/exam.js - 修复题型分组显示问题
const app = getApp();

// 默认题目数据
const defaultQuestions = [
  { type: 'single', content: "1 + 1 = ?", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correctAnswer: "B" },
  { type: 'single', content: "中国的首都是？", optionA: "上海", optionB: "北京", optionC: "广州", optionD: "深圳", correctAnswer: "B" },
  { type: 'single', content: "太阳从哪边升起？", optionA: "西边", optionB: "东边", optionC: "南边", optionD: "北边", correctAnswer: "B" },
  { type: 'single', content: "一年有多少个月？", optionA: "10个月", optionB: "11个月", optionC: "12个月", optionD: "13个月", correctAnswer: "C" },
  { type: 'single', content: "一周有多少天？", optionA: "5天", optionB: "6天", optionC: "7天", optionD: "8天", correctAnswer: "C" },
  { type: 'single', content: "2 × 3 = ?", optionA: "5", optionB: "6", optionC: "8", optionD: "9", correctAnswer: "B" },
  { type: 'single', content: "水在多少度会沸腾？", optionA: "50度", optionB: "75度", optionC: "100度", optionD: "150度", correctAnswer: "C" },
  { type: 'single', content: "一年有几个季节？", optionA: "2个", optionB: "3个", optionC: "4个", optionD: "5个", correctAnswer: "C" },
  { type: 'single', content: "世界上最长的河流是？", optionA: "长江", optionB: "黄河", optionC: "尼罗河", optionD: "亚马逊河", correctAnswer: "C" },
  { type: 'single', content: "人体最大的器官是？", optionA: "心脏", optionB: "肝脏", optionC: "皮肤", optionD: "肺", correctAnswer: "C" },
  { type: 'single', content: "5 + 5 = ?", optionA: "9", optionB: "10", optionC: "11", optionD: "12", correctAnswer: "B" },
  { type: 'single', content: "10 - 3 = ?", optionA: "5", optionB: "6", optionC: "7", optionD: "8", correctAnswer: "C" },
  { type: 'single', content: "地球是什么形状？", optionA: "平的", optionB: "方的", optionC: "圆的", optionD: "球形", correctAnswer: "D" },
  { type: 'single', content: "一个月通常有多少天？", optionA: "28-31天", optionB: "20-25天", optionC: "35-40天", optionD: "15-20天", correctAnswer: "A" },
  { type: 'single', content: "光速快还是声速快？", optionA: "声速", optionB: "光速", optionC: "一样快", optionD: "无法比较", correctAnswer: "B" },
  { type: 'single', content: "人体有多少块骨头？", optionA: "106块", optionB: "206块", optionC: "306块", optionD: "406块", correctAnswer: "B" },
  { type: 'single', content: "3 × 4 = ?", optionA: "10", optionB: "11", optionC: "12", optionD: "13", correctAnswer: "C" },
  { type: 'single', content: "世界上使用人数最多的语言是？", optionA: "英语", optionB: "中文", optionC: "西班牙语", optionD: "法语", correctAnswer: "B" },
  { type: 'single', content: "20 ÷ 4 = ?", optionA: "4", optionB: "5", optionC: "6", optionD: "7", correctAnswer: "B" },
  { type: 'single', content: "人体血液是什么颜色？", optionA: "蓝色", optionB: "绿色", optionC: "红色", optionD: "黄色", correctAnswer: "C" }
];

// 题型配置
const questionTypeConfig = {
  single: { name: '单选题', icon: '📋', color: '#667eea' },
  multiple: { name: '多选题', icon: '📑', color: '#f59e0b' },
  judge: { name: '判断题', icon: '✓', color: '#10b981' },
  fill: { name: '填空题', icon: '✏️', color: '#ef4444' },
  essay: { name: '问答题', icon: '📝', color: '#8b5cf6' }
};

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    answers: {},
    timeLeft: 30 * 60,
    timeStr: '30:00',
    isSubmitting: false,
    typeStats: [],
    currentType: 'all',
    typeConfig: questionTypeConfig
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '来参加在线考试吧！',
      path: '/pages/exam/exam'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '来参加在线考试吧！'
    };
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }

    // 确保云已初始化（双重保险）
    if (!wx.cloud) {
      console.error('wx.cloud 不存在');
      wx.showToast({ title: '云能力异常', icon: 'none' });
      return;
    }
    
    // 先从云端加载题目
    this.loadQuestionsFromCloud();
  },
  
  // 从云端加载题目
  loadQuestionsFromCloud() {
    console.log('开始从云端加载题目...');
    
    wx.cloud.callFunction({
      name: 'getExamQuestions',
      success: res => {
        console.log('云端题目获取结果:', res);
        
        if (res.result && res.result.success && res.result.data && res.result.data.length > 0) {
          // 有云端题目，同步保存到本地避免下次调用失败时读到旧题
          const questions = res.result.data;
          console.log('使用云端题目，共', questions.length, '道');
          wx.setStorageSync('adminQuestions', questions);
          this.data.questions = questions;
        } else {
          // 没有云端题目，使用本地题目
          console.log('云端没有题目，使用本地题目');
          let questions = wx.getStorageSync('adminQuestions');
          if (!questions || questions.length === 0) {
            questions = defaultQuestions;
          }
          this.data.questions = questions;
        }
        
        // 加载考试设置（设置加载完成后应用题目）
        this.loadExamSettings();
      },
      fail: err => {
        console.error('云端题目加载失败，使用本地题目', err);
        let questions = wx.getStorageSync('adminQuestions');
        if (!questions || questions.length === 0) {
          questions = defaultQuestions;
        }
        this.data.questions = questions;
        
        // 继续加载设置
        this.loadExamSettings();
      }
    });
  },
  
  // 从云数据库加载考试设置
  loadExamSettings() {
    wx.showLoading({ title: '加载设置中...' });
    console.log('开始加载云端考试设置...');
    
    // 确保云已初始化
    if (!wx.cloud) {
      console.error('wx.cloud 不存在，使用本地设置');
      wx.hideLoading();
      this.useLocalSettings();
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getExamSettings',
      success: res => {
        console.log('云函数调用成功', res);
        wx.hideLoading();
        if (res.result && res.result.success && res.result.data) {
          const settings = res.result.data;
          console.log('获取到云端设置:', settings);
          
          // 同步保存到本地，避免云函数偶尔失败时也能读到最新设置
          wx.setStorageSync('examSettings', settings);
          const examDuration = parseInt(settings.examDuration) || 30;
          const questionOrder = settings.questionOrder || 'sequence';
          const userInfo = wx.getStorageSync('userInfo');
          let questions = this.data.questions || defaultQuestions;
          
          // 根据设置决定是否打乱顺序
          if (questionOrder === 'random') {
            questions = this.shuffleArray(questions);
          }
          
          // 获取题型统计
          const typeStats = this.getTypeStats(questions);
          
          // 为每道题添加全局编号
          questions = questions.map((q, index) => ({
            ...q,
            globalIndex: index + 1
          }));
          
          this.setData({
            questions: questions,
            typeStats: typeStats,
            currentQuestion: questions[0] || null,
            currentIndex: 0,
            userInfo: userInfo,
            timeStr: `${examDuration}:00`,
            timeLeft: examDuration * 60,
            examDuration: examDuration,
            examTitle: settings.examTitle || '在线考试系统',
            questionOrder: questionOrder
          });
          
          // 开始计时
          this.startTimer();
        } else {
          console.log('云端没有设置，使用本地设置');
          // 使用本地设置作为备用
          this.useLocalSettings();
        }
      },
      fail: err => {
        console.error('加载设置失败', err);
        wx.hideLoading();
        // 使用本地设置作为备用
        this.useLocalSettings();
      }
    });
  },
  
  // 使用本地设置作为备用
  useLocalSettings() {
    const userInfo = wx.getStorageSync('userInfo');
    const settings = wx.getStorageSync('examSettings') || {};
    const examDuration = parseInt(settings.examDuration) || 30;
    const examTitle = settings.examTitle || '在线考试系统';
    const questionOrder = settings.questionOrder || 'sequence';
    let questions = this.data.questions || defaultQuestions;
    
    // 根据设置决定是否打乱顺序
    if (questionOrder === 'random') {
      questions = this.shuffleArray(questions);
    }
    
    // 获取题型统计
    const typeStats = this.getTypeStats(questions);
    
    // 为每道题添加全局编号
    questions = questions.map((q, index) => ({
      ...q,
      globalIndex: index + 1
    }));
    
    this.setData({
      questions: questions,
      typeStats: typeStats,
      currentQuestion: questions[0] || null,
      currentIndex: 0,
      userInfo: userInfo,
      timeStr: `${examDuration}:00`,
      timeLeft: examDuration * 60,
      examDuration: examDuration,
      examTitle: examTitle,
      questionOrder: questionOrder
    });
    
    // 开始计时
    this.startTimer();
  },

  // 获取题型统计
  getTypeStats(questions) {
    const counts = {
      single: 0,
      multiple: 0,
      judge: 0,
      fill: 0,
      essay: 0
    };

    questions.forEach(q => {
      const type = q.type || 'single';
      counts[type]++;
    });

    const stats = [];
    const typeOrder = ['single', 'multiple', 'judge', 'fill', 'essay'];
    typeOrder.forEach(type => {
      if (counts[type] > 0) {
        stats.push({
          type: type,
          name: questionTypeConfig[type].name,
          icon: questionTypeConfig[type].icon,
          count: counts[type]
        });
      }
    });

    return stats;
  },

  // 随机打乱数组
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // 开始计时器
  startTimer() {
    this.timer = setInterval(() => {
      const timeLeft = this.data.timeLeft - 1;
      const minutes = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const timeStr = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(this.timer);
        this.submitExam(true);
        return;
      }

      if (timeLeft === 5 * 60) {
        wx.showToast({ title: '还剩5分钟', icon: 'none', duration: 2000 });
      }

      this.setData({ timeLeft, timeStr });
    }, 1000);
  },

  // 切换到全部题目
  showAllQuestions() {
    const { questions, currentIndex } = this.data;
    this.setData({ 
      currentType: 'all', 
      currentQuestion: questions[currentIndex],
      currentIndex: currentIndex
    });
  },

  // 切换到指定题型 - 只显示该题型的题目
  showTypeQuestions(e) {
    const type = e.currentTarget.dataset.type;
    const { questions } = this.data;
    
    // 找到该题型的第一道题
    const typeIndex = questions.findIndex(q => q.type === type);
    if (typeIndex > -1) {
      this.setData({ 
        currentType: type, 
        currentQuestion: questions[typeIndex],
        currentIndex: typeIndex
      });
    }
  },

  // 选择答案
  onSelectAnswer(e) {
    const { option } = e.currentTarget.dataset;
    const { currentIndex, answers } = this.data;
    
    answers[currentIndex] = option;
    this.setData({ answers: answers });
  },

  // 多选题选择
  onMultipleSelect(e) {
    const option = e.currentTarget.dataset.option;
    const { currentIndex, answers } = this.data;
    
    let currentAnswer = answers[currentIndex] || '';
    
    if (currentAnswer.indexOf(option) > -1) {
      currentAnswer = currentAnswer.replace(option, '');
    } else {
      currentAnswer = currentAnswer + option;
    }
    
    // 按字母顺序排列
    currentAnswer = currentAnswer.split('').sort().join('');
    
    answers[currentIndex] = currentAnswer;
    this.setData({ answers: answers });
  },

  // 文字答案输入
  onTextAnswerInput(e) {
    const { currentIndex, answers } = this.data;
    answers[currentIndex] = e.detail.value;
    this.setData({ answers: answers });
  },

  // 切换题目
  onChangeQuestion(e) {
    const index = e.currentTarget.dataset.index;
    const { questions, currentType } = this.data;
    const question = questions[index];
    
    // 如果当前是题型筛选模式，检查是否是该题型的题目
    if (currentType !== 'all' && question.type !== currentType) {
      wx.showToast({ title: '请先切换到全部题目', icon: 'none' });
      return;
    }
    
    this.setData({
      currentIndex: index,
      currentQuestion: question
    });
  },

  // 上一题
  onPrevQuestion() {
    const { currentIndex, currentType, questions } = this.data;
    if (currentIndex > 0) {
      // 如果是题型筛选模式，找到上一道该题型的题
      if (currentType !== 'all') {
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (questions[i].type === currentType) {
            this.setData({ currentIndex: i, currentQuestion: questions[i] });
            return;
          }
        }
      } else {
        this.setData({ currentIndex: currentIndex - 1, currentQuestion: questions[currentIndex - 1] });
      }
    }
  },

  // 下一题
  onNextQuestion() {
    const { currentIndex, currentType, questions } = this.data;
    if (currentIndex < questions.length - 1) {
      // 如果是题型筛选模式，找到下一道该题型的题
      if (currentType !== 'all') {
        for (let i = currentIndex + 1; i < questions.length; i++) {
          if (questions[i].type === currentType) {
            this.setData({ currentIndex: i, currentQuestion: questions[i] });
            return;
          }
        }
      } else {
        this.setData({ currentIndex: currentIndex + 1, currentQuestion: questions[currentIndex + 1] });
      }
    }
  },

  // 交卷按钮点击处理
  onSubmitExam() {
    const { questions, answers } = this.data;
    
    // 计算未答题数量
    let unansweredCount = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined || userAnswer === '' || userAnswer === null) {
        unansweredCount++;
      }
    });
    
    console.log('总题目数:', questions.length);
    console.log('未答题数:', unansweredCount);
    
    if (unansweredCount > 0) {
      wx.showModal({
        title: '确认交卷',
        content: `您还有 ${unansweredCount} 道题未作答，确定要交卷吗？`,
        cancelText: '继续答题',
        confirmText: '确定交卷',
        success: res => {
          if (res.confirm) {
            this.submitExam(false);
          }
        }
      });
    } else {
      this.submitExam(false);
    }
  },

  // 提交试卷
  submitExam(isTimeout = false) {
    if (this.data.isSubmitting) return;
    
    this.setData({ isSubmitting: true });
    clearInterval(this.timer);

    const { questions, answers, userInfo } = this.data;

    // 计算成绩
    let correctCount = 0;
    const answerList = [];

    questions.forEach((q, index) => {
      const userAnswer = answers[index] || '';
      let isCorrect = false;

      // 根据题型判断答案是否正确
      if (q.type === 'single') {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'multiple') {
        // 多选题：答案必须完全一致
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'judge') {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'fill' || q.type === 'essay') {
        // 填空题和问答题：检查是否包含标准答案关键词
        const correctText = (q.correctText || '').toLowerCase().trim();
        const userAnswerText = (userAnswer || '').toLowerCase().trim();
        if (userAnswerText && correctText) {
          isCorrect = userAnswerText.includes(correctText) || correctText.includes(userAnswerText);
        }
      }
      
      if (isCorrect) correctCount++;

      // 格式化显示答案
      let displayUserAnswer = userAnswer || '未答';
      let displayCorrectAnswer = q.correctAnswer || q.correctText;
      
      if (q.type === 'judge' && displayCorrectAnswer === 'A') {
        displayCorrectAnswer = '正确';
      } else if (q.type === 'judge' && displayCorrectAnswer === 'B') {
        displayCorrectAnswer = '错误';
      }

      answerList.push({
        questionIndex: index + 1,
        question: q.content,
        userAnswer: displayUserAnswer,
        correctAnswer: displayCorrectAnswer,
        isCorrect: isCorrect,
        type: q.type
      });
    });

    const totalCount = questions.length;
    const score = Math.round((correctCount / totalCount) * 100);

    // 存储成绩
    const examResult = {
      name: userInfo.name,
      phone: userInfo.phone,
      score: score,
      correctCount: correctCount,
      totalCount: totalCount,
      submitTime: new Date().toLocaleString()
    };
    wx.setStorageSync('examResult', examResult);

    this.goToResult(score, correctCount, totalCount);
  },

  // 跳转到结果页面
  goToResult(score, correctCount, totalCount) {
    wx.redirectTo({
      url: `/pages/result/result?score=${score}&correctCount=${correctCount}&totalCount=${totalCount}`
    });
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});
