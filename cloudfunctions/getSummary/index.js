const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

// 节点 -> 分类映射（与前端 config/nodes.js 保持一致）
const GROUP_OF_NODE = {
  wake: '作息', sleep: '作息',
  eat: '饮食', drink: '饮食',
  poop: '身体', period: '身体', weight: '身体', measure: '身体', dynamic: '身体',
  baduanjin: '运动', move: '运动',
  outfit: '穿搭',
  ddl: '事件',
  custom: '自定义'
};

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  // 总记录数
  const evCount = await db.collection('events').where({ openid: OPENID }).count();

  // 拉取 date + nodeId（用于连续打卡、本周天数、分类统计）
  const all = await db.collection('events')
    .where({ openid: OPENID })
    .field({ date: true, nodeId: true })
    .limit(1000)
    .get();

  const dateSet = new Set();
  const now = new Date();
  const thisMonth = fmtDate(now).slice(0, 7); // "2026-10"
  const categoryCounts = {};

  all.data.forEach((item) => {
    if (item.date) {
      dateSet.add(item.date);
      if (item.date.indexOf(thisMonth) === 0) {
        const g = GROUP_OF_NODE[item.nodeId] || '其他';
        categoryCounts[g] = (categoryCounts[g] || 0) + 1;
      }
    }
  });

  // 连续打卡天数
  let consecutive = 0;
  const d = new Date();
  if (!dateSet.has(fmtDate(d))) d.setDate(d.getDate() - 1);
  while (dateSet.has(fmtDate(d))) {
    consecutive++;
    d.setDate(d.getDate() - 1);
  }

  // 本周有记录天数（周一起算）
  let weekDays = 0;
  const dayOfWeek = now.getDay() || 7; // 周日=7
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    if (dateSet.has(fmtDate(dd))) weekDays++;
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
    weekDays,
    categoryCounts,
    periodInfo,
    nextPredict,
    ddlList: ddls.data
  };
};
