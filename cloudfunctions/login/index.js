const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const users = db.collection('users');
  const exist = await users.where({ openid: OPENID }).get();
  if (exist.data.length === 0) {
    await users.add({
      data: { openid: OPENID, coins: 0, createdAt: db.serverDate() }
    });
  }
  return { openid: OPENID };
};
