// miniprogram/pages/admin/questions/questions.js
Page({
  data: {
    questions: [],
    showModal: false,
    showImportModal: false,
    isEditing: false,
    editIndex: -1,
    // 批量删除相关
    batchMode: false,        // 是否处于批量删除模式
    selectedIndexes: [],     // 已勾选的题目索引
    // 排序相关
    sortMode: false,         // 是否处于排序模式
    questionTypes: [
      { id: 'single', name: '单选题' },
      { id: 'multiple', name: '多选题' },
      { id: 'judge', name: '判断题' },
      { id: 'fill', name: '填空题' },
      { id: 'essay', name: '问答题' }
    ],
    selectedTypeName: '单选题',
    editForm: {
      type: 'single',
      content: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      correctText: ''
    },
    importTemplate: `【单选】1+1等于多少？
A.1 B.2 C.3 D.4
答案:B
【分隔】
【多选】以下哪些是水果？
A.苹果 B.香蕉 C.萝卜 D.葡萄
答案:ABD
【分隔】
【判断】太阳从东方升起
答案:正确
【分隔】
【填空】中国的首都是____
答案:北京
【分隔】
【问答】请简述什么是人工智能？
答案:人工智能是指让机器具有人类智能的技术`
  },

  onLoad() {
    this.loadQuestions();
  },

  onShow() {
    this.loadQuestions();
  },

  // 加载题目（优先从云端获取，同步到本地）
  loadQuestions() {
    if (!wx.cloud) {
      // 云不可用，直接读本地
      const questions = wx.getStorageSync('adminQuestions') || this.getDefaultQuestions();
      this.setData({ questions });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getExamQuestions',
      success: res => {
        let questions;
        if (res.result && res.result.success && res.result.data && res.result.data.length > 0) {
          // 云端有题目，同步到本地
          questions = res.result.data;
          wx.setStorageSync('adminQuestions', questions);
          console.log('从云端加载题目，同步到本地，共', questions.length, '道');
        } else {
          // 云端无题目，读本地
          questions = wx.getStorageSync('adminQuestions') || this.getDefaultQuestions();
        }
        this.setData({ questions });
      },
      fail: err => {
        console.error('加载云端题目失败，读本地', err);
        const questions = wx.getStorageSync('adminQuestions') || this.getDefaultQuestions();
        this.setData({ questions });
      }
    });
  },

  // 获取默认题目（全是单选题）
  getDefaultQuestions() {
    return [
      { type: 'single', content: "1 + 1 = ?", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correctAnswer: "B" },
      { type: 'single', content: "中国的首都是？", optionA: "上海", optionB: "北京", optionC: "广州", optionD: "深圳", correctAnswer: "B" },
      { type: 'single', content: "太阳从哪边升起？", optionA: "西边", optionB: "东边", optionC: "南边", optionD: "北边", correctAnswer: "B" },
      { type: 'single', content: "一年有多少个月？", optionA: "10个月", optionB: "11个月", optionC: "12个月", optionD: "13个月", correctAnswer: "C" },
      { type: 'single', content: "一周有多少天？", optionA: "5天", optionB: "6天", optionC: "7天", optionD: "8天", correctAnswer: "C" },
      { type: 'single', content: "2 × 3 = ?", optionA: "5", optionB: "6", optionC: "8", optionD: "9", correctAnswer: "B" },
      { type: 'single', content: "水在多少度会沸腾？", optionA: "50度", optionB: "75度", optionC: "100度", optionD: "150度", correctAnswer: "C" },
      { type: 'single', content: "一年有几个季节？", optionA: "2个", optionB: "3个", optionC: "4个", optionD: "5个", correctAnswer: "C" },
      { type: 'single', content: "世界上最长的河流是？", optionA: "长江", optionB: "黄河", optionC: "尼罗河", optionD: "亚马逊河", correctAnswer: "C" },
      { type: 'single', content: "人体最大的器官是？", optionA: "心脏", optionB: "肝脏", optionC: "皮肤", optionD: "肺", correctAnswer: "C" }
    ];
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEditing: false,
      editIndex: -1,
      selectedTypeName: '单选题',
      editForm: {
        type: 'single',
        content: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        correctText: ''
      }
    });
  },

  // 编辑题目
  editQuestion(e) {
    const index = e.currentTarget.dataset.index;
    const question = this.data.questions[index];
    const typeName = this.getTypeName(question.type || 'single');
    
    this.setData({
      showModal: true,
      isEditing: true,
      editIndex: index,
      selectedTypeName: typeName,
      editForm: { 
        type: question.type || 'single',
        content: question.content,
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'A',
        correctText: question.correctText || ''
      }
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({ showModal: false });
  },

  // 选择题型
  onTypeChange(e) {
    const index = e.detail.value;
    const typeObj = this.data.questionTypes[index];
    this.setData({ 
      'editForm.type': typeObj.id,
      selectedTypeName: typeObj.name
    });
  },

  // 输入处理
  onContentInput(e) {
    this.setData({ 'editForm.content': e.detail.value });
  },
  onOptionAInput(e) {
    this.setData({ 'editForm.optionA': e.detail.value });
  },
  onOptionBInput(e) {
    this.setData({ 'editForm.optionB': e.detail.value });
  },
  onOptionCInput(e) {
    this.setData({ 'editForm.optionC': e.detail.value });
  },
  onOptionDInput(e) {
    this.setData({ 'editForm.optionD': e.detail.value });
  },
  selectAnswer(e) {
    this.setData({ 'editForm.correctAnswer': e.currentTarget.dataset.answer });
  },

  // 多选题答案切换
  toggleMultipleAnswer(e) {
    const answer = e.currentTarget.dataset.answer;
    let current = this.data.editForm.correctAnswer || '';
    
    if (current.indexOf(answer) > -1) {
      current = current.replace(answer, '');
    } else {
      current = current + answer;
    }
    
    // 按字母顺序排列
    current = current.split('').sort().join('');
    
    this.setData({ 'editForm.correctAnswer': current });
  },
  onCorrectTextInput(e) {
    this.setData({ 'editForm.correctText': e.detail.value });
  },

  // 保存题目
  saveQuestion() {
    const { editForm, editIndex, isEditing } = this.data;
    const { type, content, optionA, optionB, optionC, optionD, correctAnswer, correctText } = editForm;

    // 验证
    if (!content.trim()) {
      wx.showToast({ title: '请输入题目内容', icon: 'none' });
      return;
    }

    // 根据题型验证
    if (type === 'single' || type === 'multiple') {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        wx.showToast({ title: '请完善所有选项', icon: 'none' });
        return;
      }
      if (type === 'multiple' && (!correctAnswer || correctAnswer.length < 2)) {
        wx.showToast({ title: '多选题请选择至少2个正确答案', icon: 'none' });
        return;
      }
    } else if (type === 'judge') {
      if (!correctAnswer) {
        wx.showToast({ title: '请选择正确答案', icon: 'none' });
        return;
      }
    } else if (type === 'fill' || type === 'essay') {
      if (!correctText.trim()) {
        wx.showToast({ title: '请输入标准答案', icon: 'none' });
        return;
      }
    }

    const questions = [...this.data.questions];
    const newQuestion = {
      type: type,
      content: content.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctAnswer: correctAnswer,
      correctText: correctText.trim()
    };
    
    console.log('保存题目:', newQuestion);
    
    if (isEditing) {
      questions[editIndex] = newQuestion;
    } else {
      questions.push(newQuestion);
    }

    console.log('全部题目:', questions);
    wx.setStorageSync('adminQuestions', questions);
    this.setData({ questions, showModal: false });
    
    // 同步到云端
    this.syncQuestionsToCloud(questions);
    
    wx.showToast({
      title: isEditing ? '修改成功' : '添加成功',
      icon: 'success'
    });
  },
  
  // 同步题目到云端
  syncQuestionsToCloud(questions) {
    if (!wx.cloud) {
      console.error('wx.cloud 不存在');
      return;
    }
    
    wx.cloud.callFunction({
      name: 'saveExamQuestions',
      data: { questions: questions },
      success: res => {
        console.log('题目同步到云端成功', res);
      },
      fail: err => {
        console.error('题目同步到云端失败', err);
      }
    });
  },

  // 删除题目
  deleteQuestion(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      success: res => {
        if (res.confirm) {
          const questions = [...this.data.questions];
          questions.splice(index, 1);
          wx.setStorageSync('adminQuestions', questions);
          this.setData({ questions });
          
          // 同步到云端
          this.syncQuestionsToCloud(questions);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取题型名称
  getTypeName(type) {
    const typeMap = {
      'single': '单选题',
      'multiple': '多选题',
      'judge': '判断题',
      'fill': '填空题',
      'essay': '问答题'
    };
    return typeMap[type] || '单选题';
  },

  // 获取答案显示文本
  getAnswerText(question) {
    if (question.type === 'single') {
      return question.correctAnswer;
    } else if (question.type === 'judge') {
      return question.correctAnswer === 'A' ? '正确' : '错误';
    } else {
      return question.correctText || '-';
    }
  },

  // ======= 批量删除相关 =======
  
  // 进入批量删除模式
  enterBatchMode() {
    this.setData({ batchMode: true, selectedIndexes: [] });
  },
  
  // 退出批量删除模式
  exitBatchMode() {
    this.setData({ batchMode: false, selectedIndexes: [] });
  },
  
  // 切换某道题的选中状态
  toggleSelect(e) {
    const index = e.currentTarget.dataset.index;
    const selected = [...this.data.selectedIndexes];
    const pos = selected.indexOf(index);
    if (pos > -1) {
      selected.splice(pos, 1);
    } else {
      selected.push(index);
    }
    this.setData({ selectedIndexes: selected });
  },
  
  // 全选 / 取消全选
  toggleSelectAll() {
    const total = this.data.questions.length;
    const selected = this.data.selectedIndexes;
    if (selected.length === total) {
      // 已全选 → 取消全选
      this.setData({ selectedIndexes: [] });
    } else {
      // 未全选 → 全选
      const all = Array.from({ length: total }, (_, i) => i);
      this.setData({ selectedIndexes: all });
    }
  },
  
  // 执行批量删除
  batchDelete() {
    const { selectedIndexes, questions } = this.data;
    if (selectedIndexes.length === 0) {
      wx.showToast({ title: '请先勾选要删除的题目', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedIndexes.length} 道题目吗？`,
      confirmColor: '#f44336',
      success: res => {
        if (res.confirm) {
          // 按倒序删除，避免索引错乱
          const sortedIndexes = [...selectedIndexes].sort((a, b) => b - a);
          const newQuestions = [...questions];
          sortedIndexes.forEach(idx => newQuestions.splice(idx, 1));
          
          wx.setStorageSync('adminQuestions', newQuestions);
          this.setData({
            questions: newQuestions,
            batchMode: false,
            selectedIndexes: []
          });
          
          // 同步到云端
          this.syncQuestionsToCloud(newQuestions);
          
          wx.showToast({ title: `已删除 ${selectedIndexes.length} 道题`, icon: 'success' });
        }
      }
    });
  },
  // ======= 批量删除结束 =======

  // ======= 排序相关 =======

  // 进入排序模式
  enterSortMode() {
    this.setData({ sortMode: true, batchMode: false, selectedIndexes: [] });
  },

  // 退出排序模式（自动保存并同步）
  exitSortMode() {
    const questions = this.data.questions;
    wx.setStorageSync('adminQuestions', questions);
    this.syncQuestionsToCloud(questions);
    this.setData({ sortMode: false });
    wx.showToast({ title: '顺序已保存', icon: 'success' });
  },

  // 手动保存题目（本地 + 云端）
  manualSave() {
    const questions = this.data.questions;
    wx.setStorageSync('adminQuestions', questions);
    this.syncQuestionsToCloud(questions);
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  // 上移一位
  moveUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    const questions = [...this.data.questions];
    const tmp = questions[index - 1];
    questions[index - 1] = questions[index];
    questions[index] = tmp;
    this.setData({ questions });
  },

  // 下移一位
  moveDown(e) {
    const index = e.currentTarget.dataset.index;
    const questions = [...this.data.questions];
    if (index === questions.length - 1) return;
    const tmp = questions[index + 1];
    questions[index + 1] = questions[index];
    questions[index] = tmp;
    this.setData({ questions });
  },

  // 移到最顶部
  moveToTop(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    const questions = [...this.data.questions];
    const [item] = questions.splice(index, 1);
    questions.unshift(item);
    this.setData({ questions });
  },

  // 移到最底部
  moveToBottom(e) {
    const index = e.currentTarget.dataset.index;
    const questions = [...this.data.questions];
    if (index === questions.length - 1) return;
    const [item] = questions.splice(index, 1);
    questions.push(item);
    this.setData({ questions });
  },
  // ======= 排序结束 =======

  goBack() {
    wx.redirectTo({
      url: '/pages/admin/home/home'
    });
  },

  // 显示批量导入弹窗
  showImportModal() {
    this.setData({ showImportModal: true });
  },

  // 隐藏批量导入弹窗
  hideImportModal() {
    this.setData({ showImportModal: false });
  },

  // 导入模板输入
  onImportTemplateInput(e) {
    this.setData({ importTemplate: e.detail.value });
  },

  // 确认导入 - 纯文本格式解析
  confirmImport() {
    const templateStr = this.data.importTemplate.trim();
    
    if (!templateStr) {
      wx.showToast({ title: '请粘贴题目内容', icon: 'none' });
      return;
    }

    // 显示加载提示
    wx.showLoading({ title: '正在导入...' });

    // 使用setTimeout延迟执行，避免阻塞UI
    setTimeout(() => {
      try {
        // 按【分隔】分割题目
        const blocks = templateStr.split('【分隔】');
        const validQuestions = [];
        let errorCount = 0;

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i].trim();
          if (!block || block.length < 5) continue;

          try {
            const question = this.parseQuestionBlockSimple(block);
            if (question) {
              validQuestions.push(question);
            } else {
              errorCount++;
            }
          } catch (e) {
            errorCount++;
            console.log('解析第' + (i + 1) + '题失败');
          }
        }

        wx.hideLoading();

        if (validQuestions.length === 0) {
          wx.showToast({ 
            title: errorCount > 0 ? '格式错误，请检查' : '没有有效题目', 
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 合并题目
        const currentQuestions = this.data.questions;
        const allQuestions = [...currentQuestions, ...validQuestions];
        
        // 保存到本地
        wx.setStorageSync('adminQuestions', allQuestions);
        this.setData({ 
          questions: allQuestions,
          showImportModal: false,
          importTemplate: ''
        });
        
        // 同步到云端
        this.syncQuestionsToCloud(allQuestions);

        // 显示结果
        let msg = `成功导入 ${validQuestions.length} 道题目`;
        if (errorCount > 0) {
          msg += `，${errorCount} 道格式错误`;
        }
        
        wx.showToast({
          title: msg,
          icon: 'success',
          duration: 3000
        });
      } catch (e) {
        wx.hideLoading();
        wx.showToast({ 
          title: '导入失败', 
          icon: 'none',
          duration: 2000
        });
      }
    }, 50);
  },

  // 解析单个题目块 - 简化版
  parseQuestionBlockSimple(block) {
    if (!block) return null;
    
    // 清理文本
    const cleanBlock = block
      .replace(/　/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    // 按行分割
    const lines = cleanBlock.split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;

    // 获取题型
    const firstLine = lines[0];
    let type = '';
    
    if (firstLine.includes('【单选】')) type = 'single';
    else if (firstLine.includes('【多选】')) type = 'multiple';
    else if (firstLine.includes('【判断】')) type = 'judge';
    else if (firstLine.includes('【填空】')) type = 'fill';
    else if (firstLine.includes('【问答】')) type = 'essay';
    else return null;

    // 提取题目内容
    let content = firstLine
      .replace('【单选】', '')
      .replace('【多选】', '')
      .replace('【判断】', '')
      .replace('【填空】', '')
      .replace('【问答】', '')
      .trim();
    
    const question = {
      type: type,
      content: content,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      correctText: ''
    };

    // 查找答案
    let answer = '';
    for (const line of lines) {
      if (line.includes('答案')) {
        const idx = line.indexOf('答案');
        let answerPart = line.substring(idx + 2).trim();
        answerPart = answerPart.replace(/^[:：]\s*/, '').trim();
        if (answerPart) {
          answer = answerPart;
          break;
        }
      }
    }

    if (!answer) return null;

    // 解析选项
    if (type === 'single' || type === 'multiple') {
      // 逐行查找 A. B. C. D. 格式
      for (const line of lines) {
        if (line.match(/^[A-D][.．:：]/)) {
          const parts = line.split(/\s+(?=[A-D][.．:：])/);
          for (const part of parts) {
            const m = part.match(/([A-D])[.．:：]\s*(.+)/);
            if (m) {
              const letter = m[1];
              const value = m[2].trim();
              if (letter === 'A') question.optionA = value;
              if (letter === 'B') question.optionB = value;
              if (letter === 'C') question.optionC = value;
              if (letter === 'D') question.optionD = value;
            }
          }
        }
      }

      // 设置答案
      const firstChar = answer.charAt(0).toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(firstChar)) {
        question.correctAnswer = firstChar;
      } else {
        question.correctAnswer = 'A';
      }
    }

    // 判断题
    if (type === 'judge') {
      if (['正', '对', 'T', '是'].includes(answer.charAt(0))) {
        question.correctAnswer = 'A';
      } else {
        question.correctAnswer = 'B';
      }
    }

    // 填空题和问答题
    if (type === 'fill' || type === 'essay') {
      question.correctText = answer;
    }

    if (!question.content) return null;

    return question;
  },

  // 显示导入弹窗
  showImportModal() {
    this.setData({ showImportModal: true });
  },

  // 隐藏导入弹窗
  hideImportModal() {
    this.setData({ showImportModal: false });
  },

  // 复制示例模板到剪贴板
  copyExample() {
    const template = `【单选】1+1等于多少？
A.1 B.2 C.3 D.4
答案:B
【分隔】
【多选】以下哪些是水果？
A.苹果 B.香蕉 C.萝卜 D.葡萄
答案:ABD
【分隔】
【判断】太阳从东方升起
答案:正确
【分隔】
【填空】中国的首都是____
答案:北京
【分隔】
【问答】请简述什么是人工智能？
答案:人工智能是指让机器具有人类智能的技术`;

    wx.setClipboardData({
      data: template,
      success: () => {
        wx.showToast({
          title: '示例已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      }
    });
  }
});
