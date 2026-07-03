'use client';

import { motion } from 'framer-motion';
import { EnterpriseSidebar, EnterpriseTopbar } from './EnterpriseShell';
import BottomTabBar from './BottomTabBar';

export default function PageShell({
  children,
  showTabs = true
}: {
  children?: React.ReactNode;
  showTabs?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f6f6f6] lg:flex">
      <EnterpriseSidebar />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <EnterpriseTopbar />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-6"
        >
          {children}
        </motion.main>
        {showTabs ? <BottomTabBar /> : null}
      </div>
    </div>
  );
}
