const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

const PARTS = [
  { key: 'leftArm', name: '左上臂', emoji: '💪' },
  { key: 'rightArm', name: '右上臂', emoji: '💪' },
  { key: 'leftThigh', name: '左大腿', emoji: '🦵' },
  { key: 'rightThigh', name: '右大腿', emoji: '🦵' },
  { key: 'leftCalf', name: '左小腿', emoji: '🦵' },
  { key: 'rightCalf', name: '右小腿', emoji: '🦵' }
];

Page({
  data: {
    parts: PARTS,
    values: {},
    time: ''
  },

  onLoad() {
    this.setData({ time: fmtTime(new Date()) });
  },

  onValueInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['values.' + key]: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  async save() {
    const values = this.data.values;
    const filled = PARTS.filter((p) => values[p.key] && values[p.key].trim());
    if (filled.length === 0) {
      wx.showToast({ title: '至少填一个部位', icon: 'none' });
      return;
    }
    const note = filled.map((p) => p.name + values[p.key].trim() + 'cm').join('，');
    try {
      await cloud.saveEvent({
        nodeId: 'measure',
        option: '已记 ' + filled.length + ' 项',
        time: this.data.time,
        note: note,
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
