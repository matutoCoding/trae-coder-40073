import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import QuotationList from '@/pages/quotation/QuotationList';
import QuotationForm from '@/pages/quotation/QuotationForm';
import QuotationDetail from '@/pages/quotation/QuotationDetail';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'quotation',
        children: [
          { index: true, element: <QuotationList /> },
          { path: 'new', element: <QuotationForm /> },
          { path: ':id', element: <QuotationDetail /> },
          { path: ':id/edit', element: <QuotationForm /> },
        ],
      },
      { path: 'moldbase', element: <div className="empty-state"><p className="text-neutral-500">模架库</p></div> },
      { path: 'moldbase/:code', element: <div className="empty-state"><p className="text-neutral-500">模架详情</p></div> },
      {
        path: 'machining',
        children: [
          { index: true, element: <div className="empty-state"><p className="text-neutral-500">加工管理</p></div> },
          { path: 'cavity', element: <div className="empty-state"><p className="text-neutral-500">型腔加工</p></div> },
          { path: 'cavity/:id', element: <div className="empty-state"><p className="text-neutral-500">加工任务详情</p></div> },
          { path: 'wirecut', element: <div className="empty-state"><p className="text-neutral-500">线切割</p></div> },
        ],
      },
      {
        path: 'electrode',
        children: [
          { index: true, element: <div className="empty-state"><p className="text-neutral-500">电极管理</p></div> },
          { path: ':id', element: <div className="empty-state"><p className="text-neutral-500">电极详情</p></div> },
        ],
      },
      {
        path: 'assembly',
        children: [
          { index: true, element: <div className="empty-state"><p className="text-neutral-500">装配管理</p></div> },
          { path: ':id', element: <div className="empty-state"><p className="text-neutral-500">装配详情</p></div> },
        ],
      },
      {
        path: 'trymold',
        children: [
          { index: true, element: <div className="empty-state"><p className="text-neutral-500">试模管理</p></div> },
          { path: 'record/:id', element: <div className="empty-state"><p className="text-neutral-500">试模记录</p></div> },
          { path: 'inspection/:id', element: <div className="empty-state"><p className="text-neutral-500">质量检测</p></div> },
          { path: 'lifetime', element: <div className="empty-state"><p className="text-neutral-500">寿命统计</p></div> },
        ],
      },
      {
        path: 'maintenance',
        children: [
          { index: true, element: <div className="empty-state"><p className="text-neutral-500">维修保养</p></div> },
          { path: ':id', element: <div className="empty-state"><p className="text-neutral-500">维修单详情</p></div> },
          { path: 'parts', element: <div className="empty-state"><p className="text-neutral-500">易损件管理</p></div> },
          { path: 'ledger', element: <div className="empty-state"><p className="text-neutral-500">模具台账</p></div> },
        ],
      },
      { path: 'settings', element: <div className="empty-state"><p className="text-neutral-500">系统设置</p></div> },
    ],
  },
]);

export default router;
