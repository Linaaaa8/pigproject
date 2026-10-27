const cloud = require('../../utils/cloud');

const GROUP_EMOJI = {
  '作息': '🌤', '饮食': '🍚', '身体': '💗', '运动': '🏃',
  '穿搭': '👗', '事件': '📌', '自定义': '✏️', '其他': '📝'
};

Page({
  data: {
    totalCount: 0,
    consecutive: 0,
    weekDays: 0,
    categoryList: [],
    periodInfo: '',
    nextPredict: '',
    ddlList: []
  },

  onLoad() { this.load(); },
  onShow() { this.load(); },

  async load() {
    try {
      const res = await cloud.getSummary();
      const categoryList = Object.keys(res.categoryCounts || {}).map((g) => ({
        group: g,
        emoji: GROUP_EMOJI[g] || '📝',
        count: res.categoryCounts[g]
      }));
      this.setData({
        totalCount: res.totalCount,
        consecutive: res.consecutive,
        weekDays: res.weekDays,
        categoryList,
        periodInfo: res.periodInfo,
        nextPredict: res.nextPredict,
        ddlList: res.ddlList
      });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
