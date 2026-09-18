const { NODES } = require('../../config/nodes');

Page({
  data: {
    records: [],
    loading: false
  },

  onLoad() { this.load(); },
  onShow() { this.load(); },

  async load() {
    this.setData({ loading: true });
    try {
      // TODO: 调用云函数按 openid + 时间倒序拉取 events，前端按 nodeId 映射节点名称
      const db = wx.cloud.database();
      const res = await db.collection('events').orderBy('createdAt', 'desc').limit(100).get();
      const nameMap = {};
      NODES.forEach((n) => { nameMap[n.id] = n.name; });
      const records = res.data.map((r) => ({
        ...r,
        nodeName: nameMap[r.nodeId] || r.nodeId
      }));
      this.setData({ records });
    } catch (e) {
      console.error(e);
    }
    this.setData({ loading: false });
  }
});
