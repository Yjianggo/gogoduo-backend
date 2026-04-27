// miniprogram/pages/admin/index/index.js
Page({
  data: {
    username: '',
    password: '',
    errorMsg: '',
    showPassword: false  // 是否显示密码
  },

  // 默认管理员账号密码
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'admin123'
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
      errorMsg: ''
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      errorMsg: ''
    });
  },

  // 切换密码显示/隐藏
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  onLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      this.setData({ errorMsg: '请输入账号和密码' });
      return;
    }

    if (username === this.DEFAULT_ADMIN.username && password === this.DEFAULT_ADMIN.password) {
      // 登录成功，保存登录状态
      wx.setStorageSync('adminLogin', true);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 跳转到后台首页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/admin/home/home'
        });
      }, 1000);
    } else {
      this.setData({ errorMsg: '账号或密码错误' });
    }
  },

  goBack() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});
