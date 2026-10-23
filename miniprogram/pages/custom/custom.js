const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

Page({
  data: {
    name: '',
    time: '',
    maxLength: 10
  },

  onLoad() {
    this.setData({ time: fmtTime(new Date()) });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  async save() {
    const name = this.data.name.trim();
    if (!name) {
      wx.showToast({ title: '写返个名先', icon: 'none' });
      return;
    }
    try {
      await cloud.saveEvent({
        nodeId: 'custom',
        option: name,
        time: this.data.time,
        note: '',
        images: [],
        date: fmtDate(new Date())
      });
      wx.showToast({ title: '记低咗', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 700);
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '失败，重试下', icon: 'none' });
    }
  }
});
