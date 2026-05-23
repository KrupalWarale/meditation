/**
 * File: App.tsx
 *
 * Description: Root application component with React Router configuration. Defines all admin
 * routes with authentication protection.
 *
 * Author: Navnit(Ninjacode911)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CoursesPage } from './pages/CoursesPage';
import { LessonsPage } from './pages/LessonsPage';
import { ContentPage } from './pages/ContentPage';
import { EventsPage } from './pages/EventsPage';
import { QuotesPage } from './pages/QuotesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
