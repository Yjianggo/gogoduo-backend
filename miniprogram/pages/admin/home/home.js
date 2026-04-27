// miniprogram/pages/admin/home/home.js
Page({
  onLoad() {
    // 检查是否已登录
    const isLoggedIn = wx.getStorageSync('adminLogin');
    if (!isLoggedIn) {
      wx.redirectTo({
        url: '/pages/admin/index/index'
      });
      return;
    }
  },

  // 考试设置
  goToExam() {
    wx.navigateTo({
      url: '/pages/admin/exam/exam'
    });
  },

  // 题目管理
  goToQuestions() {
    wx.navigateTo({
      url: '/pages/admin/questions/questions'
    });
  },

  // 成绩汇总
  goToScores() {
    wx.navigateTo({
      url: '/pages/admin/scores/scores'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出管理后台吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminLogin');
          wx.redirectTo({
            url: '/pages/admin/index/index'
          });
        }
      }
    });
  }
});
