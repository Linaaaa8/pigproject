const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { nodeId, option, time, note, images, date } = event;
  const res = await db.collection('events').add({
    data: {
      _openid: OPENID,
      openid: OPENID,
      nodeId,
      option: option || '',
      time: time || '',
      note: note || '',
      images: images || [],
      date: date || '',
      createdAt: db.serverDate()
    }
  });
  return { id: res._id };
};
