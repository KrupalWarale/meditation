/**
 * File: SubscriptionsPage.tsx
 *
 * Description: Subscription analytics dashboard with revenue charts, conversion funnel,
 * and plan distribution.
 *
 * Author: Navnit(Ninjacode911)
 */

import { CreditCard, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MOCK_STATS = [
  { title: 'Active Subscribers', value: '1,247', change: '+12%', trending: 'up', icon: <Users size={20} /> },
  { title: 'Monthly Revenue', value: '\u20B9 2,48,453', change: '+8%', trending: 'up', icon: <DollarSign size={20} /> },
  { title: 'Conversion Rate', value: '5.2%', change: '+0.3%', trending: 'up', icon: <TrendingUp size={20} /> },
  { title: 'Churn Rate', value: '2.1%', change: '-0.5%', trending: 'down', icon: <CreditCard size={20} /> },
];

const MOCK_PLANS = [
  { name: 'Free', users: 8753, percentage: 87.5, color: 'bg-gray-200' },
  { name: 'Monthly Premium', users: 847, percentage: 8.5, color: 'bg-primary' },
  { name: 'Annual Premium', users: 400, percentage: 4.0, color: 'bg-accent' },
];

const MOCK_REVENUE = [
  { month: 'Oct', amount: 180000 },
  { month: 'Nov', amount: 195000 },
  { month: 'Dec', amount: 210000 },
  { month: 'Jan', amount: 225000 },
  { month: 'Feb', amount: 238000 },
  { month: 'Mar', amount: 248453 },
];

const MOCK_RECENT = [
  { id: '1', user: 'Priya Sharma', plan: 'Annual', amount: 1499, date: '2026-04-05', status: 'active' },
  { id: '2', user: 'Rahul Verma', plan: 'Monthly', amount: 199, date: '2026-04-04', status: 'active' },
  { id: '3', user: 'Anita Patel', plan: 'Monthly', amount: 199, date: '2026-04-03', status: 'cancelled' },
  { id: '4', user: 'Vikram Singh', plan: 'Annual', amount: 1499, date: '2026-04-02', status: 'active' },
  { id: '5', user: 'Meera Iyer', plan: 'Monthly', amount: 199, date: '2026-04-01', status: 'active' },
];

const maxRevenue = Math.max(...MOCK_REVENUE.map(r => r.amount));

export function SubscriptionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-primary">Subscription Analytics</h2>
        <p className="mt-1 text-text-secondary">Monitor revenue, conversions, and subscriber growth</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat) => (
          <div key={stat.title} className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-primary">{stat.icon}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trending === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {stat.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-text-secondary">{stat.title}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">Monthly Revenue</h3>
          <div className="flex items-end gap-4 h-48">
            {MOCK_REVENUE.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary rounded-t-md transition-all"
                  style={{ height: `${(item.amount / maxRevenue) * 160}px` }}
                />
                <span className="text-xs text-text-secondary mt-2">{item.month}</span>
                <span className="text-xs font-semibold text-text-primary">{'\u20B9'}{Math.round(item.amount / 1000)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {MOCK_PLANS.map((plan) => (
              <div key={plan.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{plan.name}</span>
                  <span className="text-sm text-text-secondary">{plan.users.toLocaleString()} users ({plan.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${plan.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Funnel */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Conversion Funnel</h4>
            <div className="space-y-2">
              {[
                { stage: 'Total Users', count: 10000, pct: 100 },
                { stage: 'Viewed Paywall', count: 3200, pct: 32 },
                { stage: 'Started Trial', count: 800, pct: 8 },
                { stage: 'Converted to Paid', count: 520, pct: 5.2 },
              ].map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-text-secondary">{item.stage}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-16 text-right">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-surface shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-text-primary">Recent Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-text-secondary">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECENT.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{sub.user}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      sub.plan === 'Annual' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">{'\u20B9'}{sub.amount}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{sub.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
