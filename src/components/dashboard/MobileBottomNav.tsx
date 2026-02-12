import React from 'react';
import { Home, FileText, MessageCircle, User, Printer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/dashboard', icon: <Home size={20} /> },
  { label: 'POS', path: '/dashboard/pos', icon: <Printer size={20} /> },
  { label: 'Orders', path: '/dashboard/orders', icon: <FileText size={20} /> },
  { label: 'Chat', path: '/dashboard/chat', icon: <MessageCircle size={20} /> },
  { label: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed inset-x-4 bottom-4 z-50 rounded-3xl bg-printa-red/95 shadow-[0_10px_40px_rgba(231,26,26,0.35)] backdrop-blur-lg safe-area-bottom"
      aria-label="Dashboard navigation"
    >
      <div className="flex items-center justify-between px-6 py-0">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
                isActive ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              aria-label={item.label}
            >
              <span
                className={`p-2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
