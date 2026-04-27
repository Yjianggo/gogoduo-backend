// miniprogram/pages/admin/scores/scores.js
Page({
  data: {
    records: [],
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    showModal: false,
    deleteIndex: -1,
    loading: true
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  // 加载成绩记录（从云数据库）
  loadRecords() {
    wx.showLoading({ title: '加载中...' });
    console.log('开始加载成绩记录...');

    // 获取及格分数设置
    const settings = wx.getStorageSync('examSettings') || {};
    const passScore = parseInt(settings.passScore) || 60;

    // 检查云是否初始化
    if (!wx.cloud) {
      console.error('wx.cloud 不存在！');
      wx.hideLoading();
      wx.showToast({ title: '云能力未初始化', icon: 'none' });
      return;
    }

    console.log('wx.cloud 存在，开始访问云数据库...');

    // 从云数据库获取成绩
    const db = wx.cloud.database();
    console.log('db 对象创建成功', db);

    db.collection('exam_records')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        wx.hideLoading();
        console.log('从云端获取成绩成功', res.data);

        const records = res.data.map(item => ({
          _id: item._id,
          name: item.name,
          phone: item.phone,
          score: item.score,
          correctCount: item.correctCount,
          totalCount: item.totalCount,
          passScore: item.passScore || passScore,
          grade: item.grade,
          submitTime: item.submitTime
        }));

        // 计算统计数据
        this.calculateStats(records, passScore);
      })
      .catch(err => {
        wx.hideLoading();
        console.error('从云端获取成绩失败', err);

        // 云端获取失败，尝试从本地获取
        wx.showToast({
          title: '云端获取失败，尝试本地数据',
          icon: 'none',
          duration: 2000
        });

        const localRecords = wx.getStorageSync('examRecords') || [];
        this.calculateStats(localRecords, passScore);
      });
  },

  // 计算统计数据
  calculateStats(records, passScore) {
    const total = records.length;
    let totalScore = 0;
    let passCount = 0;

    records.forEach(item => {
      const score = parseInt(item.score) || 0;
      totalScore += score;
      const itemPassScore = item.passScore || passScore;
      if (score >= itemPassScore) {
        passCount++;
      }
    });

    this.setData({
      records: records,
      totalStudents: total,
      averageScore: total > 0 ? Math.round(totalScore / total) : 0,
      passRate: total > 0 ? Math.round((passCount / total) * 100) : 0,
      loading: false
    });
  },

  // 删除单条记录（从云数据库）
  deleteRecord(record) {
    const db = wx.cloud.database();
    
    wx.showLoading({ title: '删除中...' });
    
    db.collection('exam_records').doc(record._id).remove()
      .then(res => {
        wx.hideLoading();
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.loadRecords(); // 重新加载
      })
      .catch(err => {
        wx.hideLoading();
        console.error('删除失败', err);
        wx.showToast({ title: '删除失败', icon: 'none' });
      });
  },

  // 导出Excel
  exportExcel() {
    const records = this.data.records;
    
    if (records.length === 0) {
      wx.showToast({
        title: '暂无成绩记录',
        icon: 'none'
      });
      return;
    }

    // 生成CSV内容
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += '姓名,电话号码,考试分数,正确题数,总题数,等级,提交时间\n';

    records.forEach(item => {
      csvContent += `${item.name},${item.phone},${item.score},${item.correctCount || 0},${item.totalCount || 0},${item.grade || ''},${item.submitTime || ''}\n`;
    });

    // 保存文件
    const fileName = `考试成绩_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

    fs.writeFile({
      filePath: filePath,
      data: csvContent,
      encoding: 'utf8',
      success: res => {
        wx.openDocument({
          filePath: filePath,
          fileType: 'csv',
          showMenu: true,
          success: () => {
            console.log('打开成功');
          }
        });
      },
      fail: err => {
        console.error('保存文件失败', err);
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    });
  },

  // 复制到剪贴板
  copyToClipboard() {
    const records = this.data.records;
    
    if (records.length === 0) {
      wx.showToast({
        title: '暂无成绩记录',
        icon: 'none'
      });
      return;
    }

    let text = '考试成绩汇总\n';
    text += '姓名\t电话\t分数\t等级\n';

    records.forEach(item => {
      text += `${item.name}\t${item.phone}\t${item.score}\t${item.grade}\n`;
    });

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 显示删除确认
  showDeleteConfirm(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    this.setData({
      showModal: true,
      deleteIndex: index,
      currentRecord: record
    });
  },

  // 取消删除
  cancelDelete() {
    this.setData({
      showModal: false,
      deleteIndex: -1,
      currentRecord: null
    });
  },

  // 确认删除
  confirmDelete() {
    const record = this.data.currentRecord;
    if (!record) return;

    this.deleteRecord(record);

    this.setData({
      showModal: false,
      deleteIndex: -1,
      currentRecord: null
    });
  },

  // 清空所有记录（从云数据库）
  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有成绩记录吗？此操作不可恢复！',
      success: res => {
        if (res.confirm) {
          const db = wx.cloud.database();
          const records = this.data.records;

          wx.showLoading({ title: '清空中...' });

          // 批量删除
          const tasks = records.map(record => {
            return db.collection('exam_records').doc(record._id).remove();
          });

          Promise.all(tasks)
            .then(results => {
              wx.hideLoading();
              wx.showToast({
                title: '已清空',
                icon: 'success'
              });
              this.loadRecords();
            })
            .catch(err => {
              wx.hideLoading();
              console.error('清空失败', err);
              wx.showToast({
                title: '清空失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  goBack() {
    wx.redirectTo({
      url: '/pages/admin/home/home'
    });
  }
});
