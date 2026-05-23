/**
 * File: AdminLayout.tsx
 *
 * Description: Admin layout wrapper combining sidebar navigation with content area.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/courses': 'Course Management',
  '/lessons': 'Lesson Management',
  '/content': 'Content Directory',
  '/events': 'Event Management',
  '/quotes': 'Daily Quotes',
  '/notifications': 'Notifications',
  '/subscriptions': 'Subscriptions',
  '/settings': 'Settings',
};

export function AdminLayout() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Admin Panel';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-surface px-8 shadow-sm">
          <h1 className="font-heading text-xl font-semibold text-text-primary">
            {pageTitle}
          </h1>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
