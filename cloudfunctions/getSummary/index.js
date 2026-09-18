const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  // 总记录数
  const evCount = await db.collection('events').where({ openid: OPENID }).count();

  // 连续打卡天数（有记录的天数连续）
  const allDates = await db.collection('events')
    .where({ openid: OPENID })
    .field({ date: true })
    .limit(1000)
    .get();
  const dateSet = new Set(allDates.data.map((x) => x.date));
  let consecutive = 0;
  const d = new Date();
  if (!dateSet.has(fmtDate(d))) d.setDate(d.getDate() - 1); // 今天没记，从昨天起算
  while (dateSet.has(fmtDate(d))) {
    consecutive++;
    d.setDate(d.getDate() - 1);
  }

  // 来M 周期
  const periods = await db.collection('periods')
    .where({ openid: OPENID })
    .orderBy('startDate', 'asc')
    .get();

  let periodInfo = '';
  let nextPredict = '';
  const list = periods.data;
  if (list.length > 0) {
    const last = list[list.length - 1];
    if (!last.endDate) {
      periodInfo = '进行中（' + last.startDate + ' 开始）';
    } else {
      periodInfo = '上次 ' + last.startDate + ' ~ ' + last.endDate;
    }
    if (list.length >= 2) {
      let sum = 0;
      let n = 0;
      for (let i = 1; i < list.length; i++) {
        const diff = Math.round((new Date(list[i].startDate) - new Date(list[i - 1].startDate)) / 86400000);
        if (diff > 0 && diff < 100) { sum += diff; n++; }
      }
      if (n > 0) {
        const avg = Math.round(sum / n);
        const predict = new Date(list[list.length - 1].startDate);
        predict.setDate(predict.getDate() + avg);
        nextPredict = '平均周期 ' + avg + ' 天 · 下次约 ' + fmtDate(predict);
      }
    }
  }

  // 进行中 DDL
  const ddls = await db.collection('ddls')
    .where({ openid: OPENID, status: 'pending' })
    .orderBy('dueAt', 'asc')
    .limit(20)
    .get();

  return {
    totalCount: evCount.total,
    consecutive,
    periodInfo,
    nextPredict,
    ddlList: ddls.data
  };
};
