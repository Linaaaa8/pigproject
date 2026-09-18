App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // TODO: 替换成你自己的云开发环境 ID（微信开发者工具 → 云开发控制台查看）
        env: 'cloud1-d1gqrui0d0e664db2',
        traceUser: true
      });
    }
  },
  globalData: {
    openid: null,
    today: null
  }
});
