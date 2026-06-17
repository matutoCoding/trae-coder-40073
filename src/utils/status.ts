export const quotationStatusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700' },
  expired: { label: '已过期', color: 'bg-gray-100 text-gray-500' },
};

export const projectStatusMap: Record<string, { label: string; color: string }> = {
  design: { label: '设计阶段', color: 'bg-blue-100 text-blue-700' },
  machining: { label: '加工中', color: 'bg-orange-100 text-orange-700' },
  assembly: { label: '装配中', color: 'bg-purple-100 text-purple-700' },
  trymold: { label: '试模中', color: 'bg-cyan-100 text-cyan-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  maintenance: { label: '维护中', color: 'bg-yellow-100 text-yellow-700' },
  scrapped: { label: '已报废', color: 'bg-gray-100 text-gray-500' },
};

export const cavityTaskStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'bg-gray-100 text-gray-700' },
  programming: { label: '编程中', color: 'bg-blue-100 text-blue-700' },
  machining: { label: '加工中', color: 'bg-orange-100 text-orange-700' },
  inspection: { label: '质检中', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export const wireCutStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'bg-gray-100 text-gray-700' },
  processing: { label: '加工中', color: 'bg-orange-100 text-orange-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export const electrodeStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待准备', color: 'bg-gray-100 text-gray-700' },
  machining: { label: '加工中', color: 'bg-orange-100 text-orange-700' },
  using: { label: '使用中', color: 'bg-blue-100 text-blue-700' },
  worn: { label: '已损耗', color: 'bg-red-100 text-red-700' },
};

export const assemblyStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '进行中', color: 'bg-orange-100 text-orange-700' },
  inspection: { label: '检验中', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export const tryMoldStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已批准', color: 'bg-blue-100 text-blue-700' },
  ongoing: { label: '进行中', color: 'bg-orange-100 text-orange-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export const repairStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  repairing: { label: '维修中', color: 'bg-orange-100 text-orange-700' },
  testing: { label: '测试中', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export const ledgerStatusMap: Record<string, { label: string; color: string }> = {
  in_stock: { label: '在库', color: 'bg-green-100 text-green-700' },
  loaned: { label: '借出', color: 'bg-blue-100 text-blue-700' },
  using: { label: '使用中', color: 'bg-orange-100 text-orange-700' },
  repaired: { label: '维修中', color: 'bg-yellow-100 text-yellow-700' },
  scrapped: { label: '已报废', color: 'bg-gray-100 text-gray-500' },
};

export const inspectionResultMap: Record<string, { label: string; color: string }> = {
  pass: { label: '合格', color: 'bg-green-100 text-green-700' },
  fail: { label: '不合格', color: 'bg-red-100 text-red-700' },
  conditional: { label: '条件合格', color: 'bg-yellow-100 text-yellow-700' },
};

export const userRoleMap: Record<string, { label: string; color: string }> = {
  admin: { label: '管理员', color: 'bg-red-100 text-red-700' },
  sales: { label: '销售', color: 'bg-blue-100 text-blue-700' },
  designer: { label: '设计师', color: 'bg-purple-100 text-purple-700' },
  manager: { label: '生产主管', color: 'bg-orange-100 text-orange-700' },
  operator: { label: '操作员', color: 'bg-cyan-100 text-cyan-700' },
  inspector: { label: '质检员', color: 'bg-green-100 text-green-700' },
  warehouse: { label: '仓库管理员', color: 'bg-yellow-100 text-yellow-700' },
};

export const partTypeMap: Record<string, { label: string; color: string }> = {
  cavity: { label: '型腔', color: 'bg-blue-100 text-blue-700' },
  core: { label: '型芯', color: 'bg-green-100 text-green-700' },
  slide: { label: '滑块', color: 'bg-orange-100 text-orange-700' },
  lifter: { label: '斜顶', color: 'bg-purple-100 text-purple-700' },
};
