'use client';

import { motion } from 'framer-motion';
import Navbar from './Navbar';
import BottomTabBar from './BottomTabBar';

export default function PageShell({
  children,
  showTabs = true
}: {
  children?: React.ReactNode;
  showTabs?: boolean;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[#f6f6f6] pb-20">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 px-4 py-4"
      >
        {children}
      </motion.main>
      {showTabs ? <BottomTabBar /> : null}
    </div>
  );
}
