/**
 * File: DashboardPage.tsx
 *
 * Description: Admin dashboard with analytics overview cards and key metrics.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-primary">
          Welcome back
        </h2>
        <p className="mt-1 text-text-secondary">
          Analytics overview coming in Phase 2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="--"
          subtitle="Awaiting integration"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Active Courses"
          value="--"
          subtitle="Awaiting integration"
          icon={<BookOpen size={20} />}
        />
        <StatCard
          title="Upcoming Events"
          value="--"
          subtitle="Awaiting integration"
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Engagement Rate"
          value="--"
          subtitle="Awaiting integration"
          icon={<TrendingUp size={20} />}
        />
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-surface p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Quick Overview
        </h3>
        <p className="mt-2 text-text-secondary">
          This dashboard will display real-time analytics, user activity charts, and content performance
          metrics once backend integration is completed in Phase 2.
        </p>
      </div>
    </div>
  );
}
