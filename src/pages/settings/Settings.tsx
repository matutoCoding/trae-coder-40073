import { useState, useMemo } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Database,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  User as UserIcon,
  Save,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useUserStore } from '@/store/user';
import type { User as UserType } from '@/types';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  { value: 'admin', label: '系统管理员' },
  { value: 'sales', label: '销售' },
  { value: 'designer', label: '设计师' },
  { value: 'manager', label: '项目经理' },
  { value: 'operator', label: '操作员' },
  { value: 'inspector', label: '检验员' },
  { value: 'warehouse', label: '仓库员' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['全部权限'],
  sales: ['报价管理', '客户管理', '项目查看'],
  designer: ['设计管理', '项目查看', '图纸管理'],
  manager: ['项目管理', '全部查看', '报表统计'],
  operator: ['加工任务', '装配任务', '试模操作'],
  inspector: ['检验报告', '质量记录'],
  warehouse: ['出入库管理', '库存查看'],
};

const DICT_TYPES = [
  { key: 'faultType', name: '故障类型', values: ['顶针磨损', '水路堵塞', '分型面飞边', '导柱拉伤', '弹簧疲劳'] },
  { key: 'material', name: '原材料', values: ['PP', 'ABS', 'PA66+GF30', 'PC+ABS', 'POM', 'PMMA'] },
  { key: 'machineNo', name: '注塑机', values: ['IM-150T-01', 'IM-180T-02', 'IM-280T-03', 'IM-380T-04', 'IM-850T-01'] },
  { key: 'supplier', name: '供应商', values: ['东莞市恒通模具配件', '广州市精工标准件', '上海盘起贸易', '洛阳铜加工'] },
];

const SYS_LOGS = [
  { id: '1', time: '2026-06-18 14:32:15', user: 'admin', action: '登录系统', ip: '192.168.1.100', result: '成功' },
  { id: '2', time: '2026-06-18 14:28:03', user: 'zhaog', action: '新增试模记录', ip: '192.168.1.105', result: '成功' },
  { id: '3', time: '2026-06-18 14:15:42', user: 'dufei', action: '修改工单状态', ip: '192.168.1.108', result: '成功' },
  { id: '4', time: '2026-06-18 13:52:18', user: 'chenh', action: '提交检验报告', ip: '192.168.1.110', result: '成功' },
  { id: '5', time: '2026-06-18 13:30:07', user: 'lim', action: '导出装配数据', ip: '192.168.1.103', result: '成功' },
  { id: '6', time: '2026-06-18 11:45:33', user: 'unknown', action: '登录失败', ip: '192.168.1.200', result: '失败' },
  { id: '7', time: '2026-06-18 10:22:11', user: 'admin', action: '修改系统配置', ip: '192.168.1.100', result: '成功' },
  { id: '8', time: '2026-06-18 09:08:56', user: 'zhangjg', action: '新增客户', ip: '192.168.1.102', result: '成功' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');
  const [userModal, setUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserType> | null>(null);
  const [roleModal, setRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const [dictModal, setDictModal] = useState(false);
  const [dictEdit, setDictEdit] = useState<{ key: string; value: string; idx: number } | null>(null);
  const [dictData, setDictData] = useState(DICT_TYPES);
  const [searchText, setSearchText] = useState('');

  const { users, addUser, updateUser, deleteUser } = useUserStore();

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !searchText ||
          u.name.toLowerCase().includes(searchText.toLowerCase()) ||
          u.username.toLowerCase().includes(searchText.toLowerCase())
      ),
    [users, searchText]
  );

  const openUserModal = (user?: UserType) => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser({
        username: '',
        name: '',
        role: 'operator',
        email: '',
        phone: '',
        avatar: '',
      });
    }
    setUserModal(true);
  };

  const saveUser = () => {
    if (!editingUser || !editingUser.username || !editingUser.name) {
      alert('请填写用户名和姓名');
      return;
    }
    if (editingUser.id) {
      updateUser(editingUser.id, editingUser);
    } else {
      addUser(editingUser as any);
    }
    setUserModal(false);
    setEditingUser(null);
  };

  const openRoleModal = (role: string) => {
    setSelectedRole(role);
    setRolePerms([...(ROLE_PERMISSIONS[role] || [])]);
    setRoleModal(true);
  };

  const togglePerm = (p: string) => {
    setRolePerms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const openDictEdit = (key: string, value: string, idx: number) => {
    setDictEdit({ key, value, idx });
    setDictModal(true);
  };

  const saveDict = () => {
    if (!dictEdit) return;
    setDictData((prev) =>
      prev.map((d) =>
        d.key === dictEdit.key
          ? {
              ...d,
              values: d.values.map((v, i) =>
                i === dictEdit.idx ? dictEdit.value : v
              ),
            }
          : d
      )
    );
    setDictModal(false);
    setDictEdit(null);
  };

  const usersColumns: TableColumn<UserType>[] = [
    {
      key: 'username',
      title: '账号',
      dataIndex: 'username',
      width: 120,
      render: (v) => <span className="font-mono text-sm">{v}</span>,
    },
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      render: (v, r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            {v.slice(0, 1)}
          </div>
          <span className="font-medium">{v}</span>
        </div>
      ),
    },
    {
      key: 'role',
      title: '角色',
      dataIndex: 'role',
      width: 120,
      render: (v) => {
        const label = ROLE_OPTIONS.find((r) => r.value === v)?.label || v;
        const colors: Record<string, any> = {
          admin: 'danger',
          sales: 'accent',
          designer: 'info',
          manager: 'primary',
          operator: 'success',
          inspector: 'warning',
          warehouse: 'gray',
        };
        return <Tag variant={colors[v as string] || 'gray'}>{label}</Tag>;
      },
    },
    {
      key: 'email',
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-sm text-neutral-600">{v}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: '电话',
      dataIndex: 'phone',
      width: 140,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-sm text-neutral-600">{v}</span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 160,
      align: 'center',
      render: (_v, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Pencil}
            onClick={() => openUserModal(record)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => {
              if (confirm('确定删除该用户？')) deleteUser(record.id);
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-700" />
          系统设置
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          管理用户账号、角色权限、基础数据与系统日志
        </p>
      </div>

      <Tabs
        tabs={[
          { key: 'users', label: '用户管理', icon: Users },
          { key: 'roles', label: '角色权限', icon: Shield },
          { key: 'data', label: '基础数据', icon: Database },
          { key: 'logs', label: '系统日志', icon: FileText },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 'users' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="搜索账号或姓名..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  leftIcon={Search}
                  wrapperClassName="w-64"
                />
              </div>
              <Button icon={Plus} onClick={() => openUserModal()}>
                新增用户
              </Button>
            </div>

            <Table<UserType>
              columns={usersColumns}
              dataSource={filteredUsers}
              rowKey="id"
              bordered
              pageSize={10}
              emptyText="暂无用户"
            />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-neutral-700 mb-3">角色列表与权限配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLE_OPTIONS.map((role) => {
                const permCount = ROLE_PERMISSIONS[role.value]?.length || 0;
                const userCount = users.filter(
                  (u) => u.role === role.value
                ).length;
                return (
                  <div
                    key={role.value}
                    className="p-5 rounded-lg border border-neutral-200 bg-white hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => openRoleModal(role.value)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-800 text-lg">
                          {role.label}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {role.value}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <CheckSquare className="w-4 h-4" />
                        <span>{permCount} 项权限</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <UserIcon className="w-4 h-4" />
                        <span>{userCount} 用户</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500">
                        {ROLE_PERMISSIONS[role.value]?.slice(0, 3).join('、')}
                        {permCount > 3 && ' 等'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="card p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-700">基础字典数据</h3>
              <Button icon={Plus}>新增字典</Button>
            </div>
            {dictData.map((dict) => (
              <div key={dict.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-neutral-700 flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent-600" />
                    {dict.name}
                    <Tag variant="gray" className="text-xs">
                      {dict.values.length} 项
                    </Tag>
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => {
                      const newVal = prompt(`请输入新的${dict.name}值：`);
                      if (newVal?.trim()) {
                        setDictData((prev) =>
                          prev.map((d) =>
                            d.key === dict.key
                              ? { ...d, values: [...d.values, newVal.trim()] }
                              : d
                          )
                        );
                      }
                    }}
                  >
                    新增
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  {dict.values.map((val, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-primary-300 transition-all"
                    >
                      <span className="text-sm text-neutral-700">{val}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-primary-600 transition-opacity"
                        onClick={() => openDictEdit(dict.key, val, idx)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-danger transition-opacity"
                        onClick={() => {
                          if (confirm(`删除 "${val}"？`)) {
                            setDictData((prev) =>
                              prev.map((d) =>
                                d.key === dict.key
                                  ? {
                                      ...d,
                                      values: d.values.filter((_, i) => i !== idx),
                                    }
                                  : d
                              )
                            );
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-700">系统操作日志</h3>
              <div className="flex gap-2">
                <Button variant="outline">筛选条件</Button>
                <Button variant="outline">导出日志</Button>
              </div>
            </div>
            <Table
              columns={[
                { key: 'time', title: '时间', dataIndex: 'time', width: 180 },
                {
                  key: 'user',
                  title: '操作人',
                  dataIndex: 'user',
                  width: 120,
                  render: (v) => <span className="font-medium">{v}</span>,
                },
                { key: 'action', title: '操作内容', dataIndex: 'action' },
                {
                  key: 'ip',
                  title: 'IP地址',
                  dataIndex: 'ip',
                  width: 140,
                  align: 'center',
                },
                {
                  key: 'result',
                  title: '结果',
                  dataIndex: 'result',
                  width: 100,
                  align: 'center',
                  render: (v) => (
                    <Tag variant={v === '成功' ? 'success' : 'danger'}>
                      {v}
                    </Tag>
                  ),
                },
              ]}
              dataSource={SYS_LOGS}
              bordered
              pageSize={10}
              rowKey="id"
              emptyText="暂无日志"
            />
          </div>
        )}
      </div>

      <Modal
        open={userModal}
        title={
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-700" />
            {editingUser?.id ? '编辑用户' : '新增用户'}
          </div>
        }
        onClose={() => {
          setUserModal(false);
          setEditingUser(null);
        }}
        width="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUserModal(false);
                setEditingUser(null);
              }}
            >
              取消
            </Button>
            <Button icon={Save} onClick={saveUser}>
              保存
            </Button>
          </div>
        }
      >
        {editingUser && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="登录账号"
              required
              placeholder="请输入登录账号"
              value={editingUser.username || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
            />
            <Input
              label="姓名"
              required
              placeholder="请输入用户姓名"
              value={editingUser.name || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />
            <Select
              label="角色"
              required
              options={ROLE_OPTIONS}
              value={editingUser.role || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: e.target.value as any,
                })
              }
            />
            <Input
              label="邮箱"
              placeholder="请输入邮箱地址"
              value={editingUser.email || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <Input
              label="联系电话"
              placeholder="请输入联系电话"
              value={editingUser.phone || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone: e.target.value })
              }
              wrapperClassName="col-span-2"
            />
          </div>
        )}
      </Modal>

      <Modal
        open={roleModal}
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-600" />
            角色权限配置 - {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
          </div>
        }
        onClose={() => setRoleModal(false)}
        width="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRoleModal(false)}>
              关闭
            </Button>
            <Button icon={Save} onClick={() => setRoleModal(false)}>
              保存配置
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-neutral-500 mb-3">勾选需要赋予该角色的功能权限：</p>
          {[
            '项目管理',
            '报价管理',
            '设计管理',
            '加工任务',
            '装配任务',
            '试模操作',
            '检验报告',
            '维修工单',
            '出入库管理',
            '库存查看',
            '客户管理',
            '图纸管理',
            '报表统计',
            '系统设置',
            '全部查看',
          ].map((p) => (
            <div
              key={p}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors"
              onClick={() => togglePerm(p)}
            >
              {rolePerms.includes(p) ? (
                <CheckSquare className="w-5 h-5 text-primary-700" />
              ) : (
                <Square className="w-5 h-5 text-neutral-300" />
              )}
              <span
                className={cn(
                  'font-medium',
                  rolePerms.includes(p) ? 'text-neutral-800' : 'text-neutral-500'
                )}
              >
                {p}
              </span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={dictModal}
        title={
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-600" />
            编辑字典项
          </div>
        }
        onClose={() => {
          setDictModal(false);
          setDictEdit(null);
        }}
        width="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDictModal(false);
                setDictEdit(null);
              }}
            >
              取消
            </Button>
            <Button icon={Save} onClick={saveDict}>
              保存
            </Button>
          </div>
        }
      >
        {dictEdit && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-sm">
              <span className="text-neutral-500">字典类型：</span>
              <span className="font-medium ml-1">
                {dictData.find((d) => d.key === dictEdit.key)?.name}
              </span>
            </div>
            <Input
              label="字典值"
              required
              value={dictEdit.value}
              onChange={(e) =>
                setDictEdit({ ...dictEdit, value: e.target.value })
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
