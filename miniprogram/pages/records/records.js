const { NODES } = require('../../config/nodes');
const cloud = require('../../utils/cloud');

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
      const res = await cloud.getRecords({});
      const nameMap = {};
      NODES.forEach((n) => { nameMap[n.id] = n.name; });
      const records = res.list.map((r) => ({
        ...r,
        nodeName: nameMap[r.nodeId] || r.nodeId
      }));
      this.setData({ records });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
    this.setData({ loading: false });
  }
});
