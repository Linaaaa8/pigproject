const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 返回某月有记录的日期列表（用于日历打点）
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { month } = event; // 形如 "2026-10"
  const res = await db.collection('events')
    .where({ openid: OPENID })
    .field({ date: true })
    .limit(1000)
    .get();
  const dateSet = new Set();
  res.data.forEach((item) => {
    if (item.date && item.date.indexOf(month) === 0) {
      dateSet.add(item.date);
    }
  });
  return { dates: Array.from(dateSet) };
};
