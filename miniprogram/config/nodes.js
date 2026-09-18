// 节点配置：生活节点的唯一数据源（首页/全记录/汇总共用）
// type 含义：
//   status  状态打卡 —— 记选项 + 时:分
//   count   频次     —— 记选项 + 时:分 + 备注文字
//   photo   穿搭     —— 上传图片 + 备注
//   period  周期区间 —— 记开始日/结束日（来M）
//   event   事件     —— 自定义文本 + 截止时间 + 提醒（DDL）
//   custom  自定义   —— 用户自建节点

const NODES = [
  // —— 作息 ——
  {
    id: 'wake', name: '训醒未', type: 'status', group: '作息',
    options: ['自然醒', '闹钟醒', '赖床', '半夜醒过', '训得唔好'],
    defaultOption: '自然醒'
  },
  {
    id: 'sleep', name: '训着未', type: 'status', group: '作息',
    options: ['好快训着', '一般', '训唔着', '半夜醒', '未训'],
    defaultOption: '好快训着'
  },

  // —— 饮食 ——
  {
    id: 'eat', name: '食咗未', type: 'count', group: '饮食',
    options: ['早餐', '午餐', '晚餐', '加餐', '食咗少少', '未食'],
    defaultOption: '晚餐',
    notePlaceholder: '备注：食咗咩？'
  },
  {
    id: 'drink', name: '饮咗未', type: 'count', group: '饮食',
    options: ['1 杯', '2 杯', '3 杯', '4 杯+', '未饮'],
    defaultOption: '1 杯',
    notePlaceholder: '备注：饮咗咩？'
  },

  // —— 身体 ——
  {
    id: 'poop', name: '屙咗未', type: 'status', group: '身体',
    options: ['顺畅', '一般', '便秘', '肚屙', '未屙'],
    defaultOption: '顺畅'
  },
  {
    id: 'period', name: '来M未', type: 'period', group: '身体'
  },

  // —— 运动 ——
  {
    id: 'baduanjin', name: '八段锦', type: 'count', group: '运动',
    options: ['1 遍', '2 遍', '3 遍', '未做'],
    defaultOption: '1 遍',
    notePlaceholder: '备注'
  },
  {
    id: 'move', name: '郁下', type: 'count', group: '运动',
    options: ['散步', '跑步', '拉伸', '其他运动', '未郁'],
    defaultOption: '散步',
    notePlaceholder: '备注：做咗咩运动？'
  },

  // —— 穿搭 ——
  {
    id: 'outfit', name: '几靓呀', type: 'photo', group: '穿搭',
    notePlaceholder: '备注：今日着咗咩风格？'
  },

  // —— 事件 ——
  {
    id: 'ddl', name: 'DDL了', type: 'event', group: '事件',
    contentPlaceholder: '事件：要交咩？'
  },

  // —— 自定义 ——
  {
    id: 'custom', name: '仲有咩', type: 'custom', group: '自定义'
  }
];

// 按 group 分组，供首页分区渲染
function getGroupedNodes() {
  const groups = [];
  const map = {};
  NODES.forEach((n) => {
    if (!map[n.group]) {
      map[n.group] = { group: n.group, nodes: [] };
      groups.push(map[n.group]);
    }
    map[n.group].nodes.push(n);
  });
  return groups;
}

module.exports = {
  NODES,
  getGroupedNodes,
  getNodeById(id) {
    return NODES.find((n) => n.id === id) || null;
  }
};
