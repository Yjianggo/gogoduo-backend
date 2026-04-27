const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 保存考试设置
exports.main = async (event, context) => {
  const { settings } = event
  
  try {
    // 先查询是否有设置记录
    const result = await db.collection('exam_settings').limit(1).get()
    
    if (result.data && result.data.length > 0) {
      // 已有设置，更新
      await db.collection('exam_settings').doc(result.data[0]._id).update({
        data: {
          examTitle: settings.examTitle,
          examDuration: settings.examDuration,
          examLimit: settings.examLimit,
          passScore: settings.passScore,
          questionOrder: settings.questionOrder,
          examNotice: settings.examNotice,
          updateTime: db.serverDate()
        }
      })
      
      return {
        success: true,
        message: '设置已更新'
      }
    } else {
      // 没有设置，创建
      await db.collection('exam_settings').add({
        data: {
          ...settings,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
      
      return {
        success: true,
        message: '设置已保存'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
