import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

import QuotationList from '@/pages/quotation/QuotationList';
import QuotationForm from '@/pages/quotation/QuotationForm';
import QuotationDetail from '@/pages/quotation/QuotationDetail';

import MoldBaseList from '@/pages/moldbase/MoldBaseList';
import MoldBaseDetail from '@/pages/moldbase/MoldBaseDetail';

import MachiningBoard from '@/pages/machining/MachiningBoard';
import CavityList from '@/pages/machining/CavityList';
import CavityDetail from '@/pages/machining/CavityDetail';
import WireCutList from '@/pages/machining/WireCutList';

import ElectrodeList from '@/pages/electrode/ElectrodeList';
import ElectrodeDetail from '@/pages/electrode/ElectrodeDetail';

import AssemblyList from '@/pages/assembly/AssemblyList';
import AssemblyDetail from '@/pages/assembly/AssemblyDetail';

import TryMoldList from '@/pages/trymold/TryMoldList';
import TryMoldRecord from '@/pages/trymold/TryMoldRecord';
import InspectionReport from '@/pages/trymold/InspectionReport';
import LifetimeDashboard from '@/pages/trymold/LifetimeDashboard';

import RepairList from '@/pages/maintenance/RepairList';
import RepairDetail from '@/pages/maintenance/RepairDetail';
import ConsumableParts from '@/pages/maintenance/ConsumableParts';
import MoldLedger from '@/pages/maintenance/MoldLedger';

import Settings from '@/pages/settings/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />,
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
      {
        path: 'moldbase',
        children: [
          { index: true, element: <MoldBaseList /> },
          { path: ':id', element: <MoldBaseDetail /> },
        ],
      },
      {
        path: 'machining',
        children: [
          { index: true, element: <MachiningBoard /> },
          { path: 'cavity', element: <CavityList /> },
          { path: 'cavity/:id', element: <CavityDetail /> },
          { path: 'wirecut', element: <WireCutList /> },
        ],
      },
      {
        path: 'electrode',
        children: [
          { index: true, element: <ElectrodeList /> },
          { path: ':id', element: <ElectrodeDetail /> },
        ],
      },
      {
        path: 'assembly',
        children: [
          { index: true, element: <AssemblyList /> },
          { path: ':id', element: <AssemblyDetail /> },
        ],
      },
      {
        path: 'trymold',
        children: [
          { index: true, element: <TryMoldList /> },
          { path: 'record/new/:applyId', element: <TryMoldRecord /> },
          { path: 'record/:id', element: <TryMoldRecord /> },
          { path: 'inspection/:id', element: <InspectionReport /> },
          { path: 'lifetime', element: <LifetimeDashboard /> },
        ],
      },
      {
        path: 'maintenance',
        children: [
          { index: true, element: <RepairList /> },
          { path: ':id', element: <RepairDetail /> },
          { path: 'parts', element: <ConsumableParts /> },
          { path: 'ledger', element: <MoldLedger /> },
        ],
      },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
