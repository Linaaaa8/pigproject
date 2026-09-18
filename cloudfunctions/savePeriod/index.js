const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 来M周期：记开始日/结束日
// - 只有开始日：新增一条进行中（endDate=null）
// - 带结束日：优先更新最近一条未结束的周期
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { startDate, endDate } = event;
  const periods = db.collection('periods');

  if (endDate) {
    const open = await periods
      .where({ openid: OPENID, endDate: null })
      .orderBy('startDate', 'desc')
      .limit(1)
      .get();
    if (open.data.length > 0) {
      await periods.doc(open.data[0]._id).update({ data: { endDate } });
      return { updated: open.data[0]._id };
    }
  }

  const res = await periods.add({
    data: {
      openid: OPENID,
      startDate,
      endDate: endDate || null,
      createdAt: db.serverDate()
    }
  });
  return { id: res._id };
};
