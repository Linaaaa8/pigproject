const cloud = require('../../utils/cloud');

Page({
  data: {
    totalCount: 0,
    consecutive: 0,
    periodInfo: '',
    ddlList: []
  },

  onLoad() { this.load(); },
  onShow() { this.load(); },

  async load() {
    try {
      const res = await cloud.getSummary();
      this.setData({
        totalCount: res.totalCount,
        consecutive: res.consecutive,
        periodInfo: res.periodInfo + (res.nextPredict ? ' · ' + res.nextPredict : ''),
        ddlList: res.ddlList
      });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
