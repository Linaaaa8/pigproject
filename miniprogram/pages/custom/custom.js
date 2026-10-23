const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

Page({
  data: {
    name: '',
    time: '',
    note: '',
    images: [],
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

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  async chooseImage() {
    try {
      const res = await wx.chooseMedia({ count: 9, mediaType: ['image'] });
      wx.showLoading({ title: '上传中' });
      const fileIDs = [];
      for (const f of res.tempFiles) {
        const ext = (f.tempFilePath.split('.').pop() || 'jpg').toLowerCase();
        const up = await wx.cloud.uploadFile({
          cloudPath: 'custom/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext,
          filePath: f.tempFilePath
        });
        fileIDs.push(up.fileID);
      }
      this.setData({ images: this.data.images.concat(fileIDs) });
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      console.error('上传失败', e);
    }
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.idx;
    wx.previewImage({ current: this.data.images[idx], urls: this.data.images });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.idx;
    const images = this.data.images.slice();
    images.splice(idx, 1);
    this.setData({ images });
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
        note: this.data.note,
        images: this.data.images,
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
