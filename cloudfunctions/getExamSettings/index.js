const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 获取考试设置
exports.main = async (event, context) => {
  try {
    // 尝试获取现有设置
    const result = await db.collection('exam_settings').limit(1).get()
    
    // 如果没有设置，返回默认设置
    if (!result.data || result.data.length === 0) {
      const defaultSettings = {
        examTitle: '在线考试系统',
        examDuration: '30',
        examLimit: '100',
        passScore: '60',
        questionOrder: 'sequence',
        examNotice: `1. 请认真阅读每道题目后再作答
2. 考试时长为30分钟
3. 及格分数为60分
4. 答题过程中可切换题目
5. 交卷后无法修改答案
6. 请保持网络连接稳定
7. 时间结束将自动交卷`
      }
      
      // 创建默认设置
      await db.collection('exam_settings').add({
        data: {
          ...defaultSettings,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
      
      return {
        success: true,
        data: defaultSettings
      }
    }
    
    // 返回现有设置
    return {
      success: true,
      data: result.data[0]
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
