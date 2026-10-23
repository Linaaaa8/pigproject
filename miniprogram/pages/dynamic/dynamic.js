const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

Page({
  data: {
    part: '',
    value: '',
    time: ''
  },

  onLoad() {
    this.setData({ time: fmtTime(new Date()) });
  },

  onPartInput(e) { this.setData({ part: e.detail.value }); },
  onValueInput(e) { this.setData({ value: e.detail.value }); },
  onTimeChange(e) { this.setData({ time: e.detail.value }); },

  async save() {
    const part = this.data.part.trim();
    const value = this.data.value.trim();
    if (!part) {
      wx.showToast({ title: '填返个部位先', icon: 'none' });
      return;
    }
    if (!value) {
      wx.showToast({ title: '填返个数值先', icon: 'none' });
      return;
    }
    try {
      await cloud.saveEvent({
        nodeId: 'dynamic',
        option: part + ' ' + value,
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
