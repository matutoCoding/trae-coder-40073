import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
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
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'assembly', element: <AssemblyList /> },
      { path: 'assembly/:id', element: <AssemblyDetail /> },
      { path: 'trymold', element: <TryMoldList /> },
      { path: 'trymold/record/:id', element: <TryMoldRecord /> },
      { path: 'trymold/new-record/:id', element: <TryMoldRecord /> },
      { path: 'trymold/inspection/:id', element: <InspectionReport /> },
      { path: 'trymold/lifetime', element: <LifetimeDashboard /> },
      { path: 'maintenance', element: <RepairList /> },
      { path: 'maintenance/repair/:id', element: <RepairDetail /> },
      { path: 'maintenance/consumable', element: <ConsumableParts /> },
      { path: 'maintenance/ledger', element: <MoldLedger /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
