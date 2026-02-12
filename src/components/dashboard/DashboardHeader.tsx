import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isSidebarOpen, toggleSidebar }) => (
  <header className="h-16 flex items-center px-4 border-b border-gray-100 bg-white sticky top-0 z-20">
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
    </Button>
  </header>
);
