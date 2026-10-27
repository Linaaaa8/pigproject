const { NODES } = require('../../config/nodes');
const cloud = require('../../utils/cloud');

function pad(n) { return n < 10 ? '0' + n : '' + n; }

Page({
  data: {
    year: 0,
    month: 0,
    monthLabel: '',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    cells: [],
    selectedDate: '',
    dayRecords: [],
    consecutive: 0
  },

  onLoad() {
    this.nameMap = {};
    NODES.forEach((n) => { this.nameMap[n.id] = n.name; });
    const now = new Date();
    this.buildMonth(now.getFullYear(), now.getMonth() + 1);
  },

  onShow() {
    if (this.data.year) this.refresh();
  },

  refresh() {
    const { year, month, selectedDate } = this.data;
    this.loadMonthDates(year + '-' + pad(month));
    this.loadDayRecords(selectedDate);
    this.loadSummary();
  },

  buildMonth(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ empty: true, id: 'e' + i });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        date: year + '-' + pad(month) + '-' + pad(d),
        id: 'd' + d,
        hasRecord: false,
        isToday: (now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === d)
      });
    }
    const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth() + 1);
    const selectedDate = isCurrentMonth
      ? year + '-' + pad(month) + '-' + pad(now.getDate())
      : year + '-' + pad(month) + '-01';
    this.setData({ year, month, monthLabel: year + '年' + month + '月', cells, selectedDate });
    this.loadMonthDates(year + '-' + pad(month));
    this.loadDayRecords(selectedDate);
    this.loadSummary();
  },

  async loadMonthDates(monthStr) {
    try {
      const res = await cloud.getMonthDates({ month: monthStr });
      const dateSet = new Set(res.dates);
      const cells = this.data.cells.map((c) => (c.empty ? c : { ...c, hasRecord: dateSet.has(c.date) }));
      this.setData({ cells });
    } catch (e) {
      console.error(e);
    }
  },

  async loadDayRecords(date) {
    try {
      const res = await cloud.getRecords({ date });
      const dayRecords = res.list.map((r) => ({ ...r, nodeName: this.nameMap[r.nodeId] || r.nodeId }));
      this.setData({ dayRecords });
    } catch (e) {
      console.error(e);
    }
  },

  async loadSummary() {
    try {
      const res = await cloud.getSummary();
      this.setData({ consecutive: res.consecutive });
    } catch (e) {
      console.error(e);
    }
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) { month = 12; year--; }
    this.buildMonth(year, month);
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) { month = 1; year++; }
    this.buildMonth(year, month);
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;
    this.setData({ selectedDate: date });
    this.loadDayRecords(date);
  }
});
