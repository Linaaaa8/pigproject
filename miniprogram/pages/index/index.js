const { getGroupedNodes, getNodeById } = require('../../config/nodes');
const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

Page({
  data: {
    groups: [],
    date: '',
    dateLabel: '',
    todayCount: 0,
    activeId: '',
    activeNode: null,
    selOption: '',
    selTime: '',
    selNote: '',
    selImages: [],
    recorded: {},
    // 来M 周期
    periodStart: '',
    periodEnd: '',
    // DDL 事件
    ddlContent: '',
    ddlDue: '',
    ddlRemind: true
  },

  onLoad() {
    const now = new Date();
    this.setData({
      groups: getGroupedNodes(),
      date: fmtDate(now),
      dateLabel: this.buildLabel(now),
      selTime: fmtTime(now)
    });
    this.login();
    this.loadToday();
  },

  buildLabel(d) {
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + week;
  },

  async login() {
    try {
      const res = await cloud.login();
      getApp().globalData.openid = res.openid;
    } catch (e) {
      console.error('登录失败', e);
    }
  },

  prevDay() { this.shiftDay(-1); },
  nextDay() { this.shiftDay(1); },

  shiftDay(delta) {
    const d = new Date(this.data.date.replace(/-/g, '/'));
    d.setDate(d.getDate() + delta);
    this.setData({ date: fmtDate(d), dateLabel: this.buildLabel(d) });
    this.loadToday();
  },

  async loadToday() {
    try {
      const res = await cloud.getRecords({ date: this.data.date });
      const recorded = {};
      res.list.forEach((item) => {
        if (!recorded[item.nodeId]) {
          recorded[item.nodeId] = { option: item.option, time: item.time };
        }
      });
      this.setData({ recorded, todayCount: res.list.length });
    } catch (e) {
      console.error('加载今日记录失败', e);
    }
  },

  togglePanel(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.activeId === id) {
      this.setData({ activeId: '', activeNode: null });
      return;
    }
    const node = getNodeById(id);
    this.setData({
      activeId: id,
      activeNode: node,
      selOption: node.defaultOption || '',
      selTime: this.nowTime(),
      selNote: '',
      selImages: [],
      periodStart: this.data.date,
      periodEnd: '',
      ddlContent: '',
      ddlDue: '',
      ddlRemind: true
    });
  },

  nowTime() { return fmtTime(new Date()); },

  onOptionTap(e) {
    this.setData({ selOption: e.currentTarget.dataset.opt });
  },
  onTimeChange(e) {
    this.setData({ selTime: e.detail.value });
  },
  onNoteInput(e) {
    this.setData({ selNote: e.detail.value });
  },
  onPeriodStart(e) { this.setData({ periodStart: e.detail.value }); },
  onPeriodEnd(e) { this.setData({ periodEnd: e.detail.value }); },
  onDdlContent(e) { this.setData({ ddlContent: e.detail.value }); },
  onDdlDue(e) { this.setData({ ddlDue: e.detail.value }); },
  onDdlRemind(e) { this.setData({ ddlRemind: e.detail.value }); },

  async chooseImage() {
    try {
      const res = await wx.chooseMedia({ count: 9, mediaType: ['image'] });
      wx.showLoading({ title: '上传中' });
      const fileIDs = [];
      for (const f of res.tempFiles) {
        const ext = (f.tempFilePath.split('.').pop() || 'jpg').toLowerCase();
        const up = await wx.cloud.uploadFile({
          cloudPath: 'outfit/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext,
          filePath: f.tempFilePath
        });
        fileIDs.push(up.fileID);
      }
      this.setData({ selImages: this.data.selImages.concat(fileIDs) });
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      console.error('上传失败', e);
    }
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.idx;
    wx.previewImage({ current: this.data.selImages[idx], urls: this.data.selImages });
  },

  async save() {
    const node = this.data.activeNode;
    if (!node) return;
    try {
      if (node.type === 'period') {
        await cloud.savePeriod({
          startDate: this.data.periodStart,
          endDate: this.data.periodEnd || null
        });
        const label = this.data.periodStart + (this.data.periodEnd ? ' ~ ' + this.data.periodEnd : '');
        this.setData({ 'recorded.period': { option: label } });
      } else if (node.type === 'event') {
        // 开启提醒时，先请求订阅消息授权（一次性订阅）
        if (this.data.ddlRemind) {
          await new Promise((resolve) => {
            wx.requestSubscribeMessage({
              tmplIds: ['YOUR_DDL_TEMPLATE_ID'], // TODO: 替换成后台申请的订阅消息模板 ID
              complete: () => resolve()
            });
          });
        }
        await cloud.saveDdl({
          content: this.data.ddlContent,
          dueAt: this.data.ddlDue,
          remindAt: this.data.ddlRemind ? this.data.ddlDue : ''
        });
        this.setData({ 'recorded.ddl': { option: this.data.ddlContent } });
      } else {
        await cloud.saveEvent({
          nodeId: node.id,
          option: this.data.selOption,
          time: this.data.selTime,
          note: this.data.selNote,
          images: this.data.selImages,
          date: this.data.date
        });
        this.setData({
          ['recorded.' + node.id]: { option: this.data.selOption, time: this.data.selTime }
        });
      }
      wx.showToast({ title: '记低咗', icon: 'success' });
      this.setData({ activeId: '', activeNode: null });
      this.loadToday();
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '失败，重试下', icon: 'none' });
    }
  }
});
