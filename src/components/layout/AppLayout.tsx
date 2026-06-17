import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden bg-primary-50/30">
      <Sidebar collapsed={collapsed} onToggle={setCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          <div className="mx-auto max-w-[1600px] min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
