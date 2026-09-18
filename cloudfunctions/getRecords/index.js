const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 拉取记录（可按日期过滤），按创建时间倒序
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { date, limit = 100 } = event;
  const where = { openid: OPENID };
  if (date) where.date = date;

  const res = await db.collection('events')
    .where(where)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return { list: res.data };
};
