// miniprogram/app.js

// 初始化微信云开发
wx.cloud.init({
  env: 'cloud1-5gr0rd3r8c63a492',
  traceUser: true
});

App({
  globalData: {
    userInfo: null,
    questions: [],
    examSession: null
  }
})
