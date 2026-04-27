// 云函数：获取考试题目
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 明确读取固定 _id 的那条记录，与 saveExamQuestions 保持一致
    const result = await db.collection('exam_questions')
      .doc('main_questions')
      .get();

    if (result.data && result.data.questions) {
      return {
        success: true,
        data: result.data.questions,
        message: '获取题目成功'
      };
    }

    return {
      success: true,
      data: [],
      message: '暂无题目'
    };

  } catch (err) {
    // 文档不存在时 doc().get() 会抛异常，按暂无题目处理
    if (err.errCode === -502005 || err.message.includes('not exist') || err.message.includes('does not exist')) {
      return { success: true, data: [], message: '暂无题目' };
    }
    console.error('获取题目失败', err);
    return {
      success: false,
      error: err.message || '获取题目失败'
    };
  }
};
