/**
 * File: Sidebar.tsx
 *
 * Description: Navigation sidebar with route links, active state highlighting, and logout button.
 *
 * Author: Navnit(Ninjacode911)
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  FolderOpen,
  Calendar,
  Quote,
  Bell,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';
import { logout } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Users', path: '/users', icon: <Users size={20} /> },
  { label: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
  { label: 'Lessons', path: '/lessons', icon: <FileText size={20} /> },
  { label: 'Content', path: '/content', icon: <FolderOpen size={20} /> },
  { label: 'Events', path: '/events', icon: <Calendar size={20} /> },
  { label: 'Quotes', path: '/quotes', icon: <Quote size={20} /> },
  { label: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
  { label: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-primary text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-heading text-lg font-bold">
          M
        </div>
        <span className="font-heading text-xl font-semibold tracking-wide">MAA Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
