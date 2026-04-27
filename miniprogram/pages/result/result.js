// miniprogram/pages/result/result.js
const app = getApp();

Page({
  data: {
    score: 0,
    correctCount: 0,
    totalCount: 0,
    wrongCount: 0,
    accuracy: 0,
    passScore: 60,
    grade: '',
    gradeClass: '',
    gradeDesc: '',
    userInfo: null
  },

  onLoad: function(options) {
    const { score, correctCount, totalCount } = options;
    
    const wrongCount = parseInt(totalCount) - parseInt(correctCount);
    const accuracy = Math.round((parseInt(correctCount) / parseInt(totalCount)) * 100);
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    // 先用本地设置展示（让页面先渲染出来）
    const localSettings = wx.getStorageSync('examSettings') || {};
    const localPassScore = parseInt(localSettings.passScore) || 60;
    
    this.setData({
      score,
      correctCount: parseInt(correctCount),
      totalCount: parseInt(totalCount),
      wrongCount,
      accuracy,
      passScore: localPassScore,
      userInfo: userInfo
    });
    
    // 从云端获取最新及格分，再更新结果
    this.loadPassScoreFromCloud(score, correctCount, totalCount, userInfo);
  },
  
  // 从云端获取及格分
  loadPassScoreFromCloud(score, correctCount, totalCount, userInfo) {
    if (!wx.cloud) {
      this.applyPassScore(parseInt(this.data.passScore), score, correctCount, totalCount, userInfo);
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getExamSettings',
      success: res => {
        let passScore = 60;
        if (res.result && res.result.success && res.result.data) {
          passScore = parseInt(res.result.data.passScore) || 60;
          console.log('从云端获取及格分:', passScore);
        }
        this.applyPassScore(passScore, score, correctCount, totalCount, userInfo);
      },
      fail: err => {
        console.error('获取云端设置失败，使用本地设置', err);
        this.applyPassScore(parseInt(this.data.passScore), score, correctCount, totalCount, userInfo);
      }
    });
  },
  
  // 应用及格分，计算等级
  applyPassScore(passScore, score, correctCount, totalCount, userInfo) {
    let grade, gradeClass, gradeDesc;
    const numScore = parseInt(score);
    
    if (numScore >= passScore) {
      grade = '及格';
      gradeClass = 'pass';
      gradeDesc = '恭喜您达到及格线！';
    } else {
      grade = '不及格';
      gradeClass = 'fail';
      gradeDesc = `未达到${passScore}分及格线，请认真学习后重试。`;
    }

    this.setData({
      passScore,
      grade,
      gradeClass,
      gradeDesc
    });

    // 保存成绩到云数据库
    this.saveToCloud({
      name: userInfo?.name || '',
      phone: userInfo?.phone || '',
      score: parseInt(score),
      correctCount: parseInt(correctCount),
      totalCount: parseInt(totalCount),
      passScore: passScore,
      grade: grade,
      submitTime: new Date().toLocaleString('zh-CN')
    });

    // 清除登录状态
    wx.removeStorageSync('userInfo');
    app.globalData.questions = [];
  },

  // 保存成绩到云数据库
  saveToCloud(record) {
    wx.cloud.callFunction({
      name: 'submitAnswer',
      data: {
        name: record.name,
        phone: record.phone,
        score: record.score,
        correctCount: record.correctCount,
        totalCount: record.totalCount,
        passScore: record.passScore,
        submitTime: record.submitTime
      },
      success: res => {
        console.log('成绩已保存到云端', res);
      },
      fail: err => {
        console.error('保存到云端失败', err);
        // 云端失败时保存到本地
        this.saveToLocal(record);
      }
    });
  },

  // 本地存储（备用）
  saveToLocal(record) {
    const records = wx.getStorageSync('examRecords') || [];
    records.unshift(record);
    wx.setStorageSync('examRecords', records);
  },

  goHome: function() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});

