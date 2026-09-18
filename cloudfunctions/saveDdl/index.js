const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { content, dueAt, remindAt } = event;
  const res = await db.collection('ddls').add({
    data: {
      openid: OPENID,
      content: content || '',
      dueAt: dueAt || '',
      remindAt: remindAt || '',
      reminded: false,
      status: 'pending',
      createdAt: db.serverDate()
    }
  });
  return { id: res._id };
};
