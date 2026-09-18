// 云函数调用统一封装（Promise 化）
function call(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => resolve(res.result),
      fail: (err) => reject(err)
    });
  });
}

module.exports = {
  call,
  // 静默登录，换取 openid
  login() {
    return call('login');
  },
  // 保存一次日常记录（状态/频次/穿搭）
  saveEvent(payload) {
    return call('saveEvent', payload);
  },
  // 记录来M周期（开始/结束）
  savePeriod(payload) {
    return call('savePeriod', payload);
  },
  // 保存 DDL 事件提醒
  saveDdl(payload) {
    return call('saveDdl', payload);
  }
};
