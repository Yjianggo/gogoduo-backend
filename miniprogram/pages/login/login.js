// miniprogram/pages/login/login.js - 纯本地版本，不依赖云函数
const app = getApp();

Page({
  data: {
    name: '',
    phone: '',
    noticeAgreed: false
  },

  onLoad() {
    // 获取考试设置
    const settings = wx.getStorageSync('examSettings') || {};
    this.setData({
      examDuration: settings.examDuration || 30,
      passScore: settings.passScore || 60
    });
  },

  // 获取姓名输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
    this.updateButtonState();
  },

  // 获取电话输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
    this.updateButtonState();
  },

  // 同意须知
  onNoticeChange(e) {
    const agreed = e.detail.value.includes('agreed');
    this.setData({
      noticeAgreed: agreed
    });
    this.updateButtonState();
  },

  // 更新按钮状态
  updateButtonState() {
    const { name, phone, noticeAgreed } = this.data;
    const canLogin = name.trim() && phone.length === 11 && noticeAgreed;
    this.setData({
      canLogin: canLogin
    });
  },

  // 显示考试须知
  showNotice() {
    const settings = wx.getStorageSync('examSettings') || {};
    const examDuration = settings.examDuration || 30;
    const passScore = settings.passScore || 60;
    
    wx.showModal({
      title: '考试须知',
      content: `1. 请认真阅读每道题目后再作答\n2. 考试时长为${examDuration}分钟\n3. 及格分数为${passScore}分\n4. 答题过程中可切换题目\n5. 交卷后无法修改答案\n6. 请保持网络连接稳定\n7. 时间结束将自动交卷`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 返回首页
  goBack() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  // 登录并进入考试（纯本地版本）
  onLogin() {
    const { name, phone } = this.data;

    // 验证姓名
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 直接存储用户信息并跳转
    const userId = 'user_' + Date.now();
    wx.setStorageSync('userInfo', {
      userId: userId,
      name: name.trim(),
      phone: phone.trim()
    });

    // 直接跳转到考试页面
    wx.redirectTo({
      url: '/pages/exam/exam'
    });
  }
});
