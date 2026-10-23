const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

Page({
  data: {
    weight: '',
    time: ''
  },

  onLoad() {
    this.setData({ time: fmtTime(new Date()) });
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  async save() {
    const w = this.data.weight.trim();
    if (!w) {
      wx.showToast({ title: '填返个体重先', icon: 'none' });
      return;
    }
    const num = parseFloat(w);
    if (isNaN(num) || num <= 0 || num > 500) {
      wx.showToast({ title: '体重格式唔啱', icon: 'none' });
      return;
    }
    try {
      await cloud.saveEvent({
        nodeId: 'weight',
        option: w + ' kg',
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
