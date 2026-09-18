const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 定时触发器：扫描到点的 DDL 提醒，发送订阅消息
// 注意：订阅消息为「一次性」，用户创建 DDL 时授权一次可发一条
exports.main = async () => {
  const _ = db.command;
  const now = Date.now();
  const list = await db.collection('ddls')
    .where({
      reminded: false,
      remindAt: _.neq('').and(_.lte(now))
    })
    .limit(100)
    .get();

  for (const item of list.data) {
    // TODO: 调用 cloud.openapi.subscribeMessage.send 发送提醒
    // 需后台申请订阅消息模板，替换 TEMPLATE_ID
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: item.openid,
        templateId: 'YOUR_DDL_TEMPLATE_ID',
        page: 'pages/index/index',
        data: {
          thing1: { value: (item.content || 'DDL').slice(0, 20) },
          date2: { value: item.dueAt || '' }
        }
      });
    } catch (e) {
      console.error('发送提醒失败', item._id, e);
    }
    await db.collection('ddls').doc(item._id).update({ data: { reminded: true } });
  }

  return { count: list.data.length };
};
