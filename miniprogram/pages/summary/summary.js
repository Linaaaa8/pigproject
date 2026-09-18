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
      const db = wx.cloud.database();
      // TODO: 完善统计——总记录数、连续打卡天数、来M周期与预测、DDL 列表
      const ev = await db.collection('events').count();
      this.setData({ totalCount: ev.total });

      const ddls = await db.collection('ddls')
        .where({ status: 'pending' })
        .orderBy('dueAt', 'asc')
        .limit(20)
        .get();
      this.setData({ ddlList: ddls.data });
    } catch (e) {
      console.error(e);
    }
  }
});
