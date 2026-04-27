// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  
  try {
    // 提交考试成绩
    const { name, phone, score, correctCount, totalCount, passScore, submitTime } = event
    
    // 添加成绩记录
    const result = await db.collection('exam_records').add({
      data: {
        name: name,
        phone: phone,
        score: score,
        correctCount: correctCount,
        totalCount: totalCount,
        passScore: passScore,
        grade: score >= passScore ? '及格' : '不及格',
        submitTime: submitTime || new Date().toISOString(),
        createTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '成绩保存成功',
      data: result
    }
  } catch (err) {
    console.error('保存成绩失败', err)
    return {
      success: false,
      message: '保存成绩失败',
      error: err.message
    }
  }
}
