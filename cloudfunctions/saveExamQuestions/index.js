// 云函数：保存考试题目
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { questions } = event;
    
    if (!questions || !Array.isArray(questions)) {
      return {
        success: false,
        error: '题目数据格式错误'
      };
    }

    const mainId = 'main_questions';

    // 先尝试更新，更新失败（文档不存在）再新增
    try {
      const updateRes = await db.collection('exam_questions')
        .doc(mainId)
        .update({
          data: {
            questions: questions,
            updateTime: db.serverDate()
          }
        });

      // updated > 0 说明更新成功
      if (updateRes.stats && updateRes.stats.updated > 0) {
        return { success: true, message: '题目更新成功' };
      }
      // updated === 0 说明文档不存在，走新增逻辑
    } catch (updateErr) {
      // 文档不存在时 update 会抛异常，忽略继续新增
      console.log('update 未命中，将新增文档', updateErr.message);
    }

    // 新增
    await db.collection('exam_questions').add({
      data: {
        _id: mainId,
        questions: questions,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });

    return { success: true, message: '题目保存成功' };

  } catch (err) {
    console.error('保存题目失败', err);
    return {
      success: false,
      error: err.message || '保存题目失败'
    };
  }
};
