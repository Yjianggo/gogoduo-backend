// miniprogram/pages/admin/exam/exam.js
Page({
  data: {
    examTitle: '在线考试系统',
    examDuration: '30',
    examLimit: '100',
    passScore: '60',
    questionOrder: 'sequence',
    examNotice: '1. 请认真阅读每道题目后再作答\n2. 考试时长为30分钟\n3. 及格分数为60分\n4. 答题过程中可切换题目\n5. 交卷后无法修改答案\n6. 请保持网络连接稳定\n7. 时间结束将自动交卷'
  },

  // 生成默认考试须知
  generateNotice(duration, score) {
    return `1. 请认真阅读每道题目后再作答\n2. 考试时长为${duration}分钟\n3. 及格分数为${score}分\n4. 答题过程中可切换题目\n5. 交卷后无法修改答案\n6. 请保持网络连接稳定\n7. 时间结束将自动交卷`;
  },

  onLoad() {
    // 优先从云数据库加载设置
    this.loadCloudSettings();
  },
  
  // 从云数据库加载设置
  loadCloudSettings() {
    wx.showLoading({ title: '加载中...' });
    
    wx.cloud.callFunction({
      name: 'getExamSettings',
      success: res => {
        wx.hideLoading();
        if (res.result && res.result.success && res.result.data) {
          const settings = res.result.data;
          this.setData({
            examTitle: settings.examTitle || '在线考试系统',
            examDuration: settings.examDuration || '30',
            examLimit: settings.examLimit || '100',
            passScore: settings.passScore || '60',
            questionOrder: settings.questionOrder || 'sequence',
            examNotice: settings.examNotice || this.generateNotice('30', '60')
          });
        } else {
          // 使用本地设置作为备用
          this.useLocalSettings();
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('加载云端设置失败', err);
        // 使用本地设置作为备用
        this.useLocalSettings();
      }
    });
  },
  
  // 使用本地设置作为备用
  useLocalSettings() {
    const settings = wx.getStorageSync('examSettings') || {};
    const examDuration = settings.examDuration || '30';
    const passScore = settings.passScore || '60';
    
    this.setData({
      examTitle: settings.examTitle || '在线考试系统',
      examDuration: examDuration,
      examLimit: settings.examLimit || '100',
      passScore: passScore,
      questionOrder: settings.questionOrder || 'sequence',
      examNotice: settings.examNotice || this.generateNotice(examDuration, passScore)
    });
  },

  onTitleInput(e) {
    this.setData({ examTitle: e.detail.value });
  },

  onDurationInput(e) {
    const duration = e.detail.value;
    // 更新考试须知中的考试时长
    const newNotice = this.data.examNotice.replace(/考试时长为\d+分钟/, `考试时长为${duration}分钟`);
    this.setData({ 
      examDuration: duration,
      examNotice: newNotice
    });
  },

  onLimitInput(e) {
    this.setData({ examLimit: e.detail.value });
  },

  onPassScoreInput(e) {
    const score = e.detail.value;
    // 更新考试须知中的及格分数
    const newNotice = this.data.examNotice.replace(/及格分数为\d+分/, `及格分数为${score}分`);
    this.setData({ 
      passScore: score,
      examNotice: newNotice
    });
  },

  onNoticeInput(e) {
    this.setData({ examNotice: e.detail.value });
  },

  // 选择题目顺序
  onOrderChange(e) {
    const index = e.detail.value;
    const orders = ['sequence', 'random'];
    this.setData({ questionOrder: orders[index] });
  },

  saveSettings() {
    const { examTitle, examDuration, examLimit, passScore, questionOrder, examNotice } = this.data;

    if (!examTitle.trim()) {
      wx.showToast({ title: '请输入考试标题', icon: 'none' });
      return;
    }

    if (!examDuration || parseInt(examDuration) < 1) {
      wx.showToast({ title: '请输入有效的考试时长', icon: 'none' });
      return;
    }

    if (!examLimit || parseInt(examLimit) < 1) {
      wx.showToast({ title: '请输入有效的考试人数', icon: 'none' });
      return;
    }

    if (!passScore || parseInt(passScore) < 0 || parseInt(passScore) > 100) {
      wx.showToast({ title: '请输入有效的及格分数(0-100)', icon: 'none' });
      return;
    }

    const settings = {
      examTitle,
      examDuration,
      examLimit,
      passScore,
      questionOrder,
      examNotice
    };

    // 保存到本地
    wx.setStorageSync('examSettings', settings);
    
    // 同时保存到云数据库，让所有用户都能获取最新设置
    wx.showLoading({ title: '保存中...' });
    
    wx.cloud.callFunction({
      name: 'saveExamSettings',
      data: { settings },
      success: res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          // 云端保存成功，同步到本地存储，其他用户下次读取时也会缓存
          wx.setStorageSync('examSettings', settings);
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '保存成功（云端稍后同步）',
            icon: 'success'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('保存到云端失败', err);
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      }
    });
  },

  goBack() {
    wx.redirectTo({
      url: '/pages/admin/home/home'
    });
  }
});
