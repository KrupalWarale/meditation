/**
 * File: NotificationsPage.tsx
 *
 * Description: Notification dispatch page for broadcast and targeted push notifications.
 *
 * Author: Navnit(Ninjacode911)
 */

import { useState } from 'react';
import {
  Send,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Users,
  ChevronDown,
} from 'lucide-react';

type NotificationTarget = 'All Users' | 'Premium Only' | 'Free Users';

interface SentNotification {
  id: string;
  title: string;
  target: NotificationTarget;
  sentAt: string;
  delivered: number;
  read: number;
}

const MOCK_NOTIFICATIONS: SentNotification[] = [
  {
    id: 'n1',
    title: 'New Course: Foundations of Meditation is live!',
    target: 'All Users',
    sentAt: '2026-04-05 09:00 AM',
    delivered: 12450,
    read: 8340,
  },
  {
    id: 'n2',
    title: 'Premium Feature: Unlock Advanced Vipassana',
    target: 'Premium Only',
    sentAt: '2026-04-04 02:30 PM',
    delivered: 3200,
    read: 2180,
  },
  {
    id: 'n3',
    title: 'Full Moon Meditation Event - Register Now',
    target: 'All Users',
    sentAt: '2026-04-03 11:00 AM',
    delivered: 12300,
    read: 6890,
  },
  {
    id: 'n4',
    title: 'Try Premium Free for 7 Days',
    target: 'Free Users',
    sentAt: '2026-04-02 10:00 AM',
    delivered: 9100,
    read: 4230,
  },
  {
    id: 'n5',
    title: 'Daily Reminder: Your meditation streak awaits',
    target: 'All Users',
    sentAt: '2026-04-01 07:00 AM',
    delivered: 12100,
    read: 7650,
  },
];

const TARGET_OPTIONS: NotificationTarget[] = [
  'All Users',
  'Premium Only',
  'Free Users',
];

const TARGET_STYLES: Record<NotificationTarget, string> = {
  'All Users': 'bg-blue-50 text-blue-700',
  'Premium Only': 'bg-purple-50 text-purple-700',
  'Free Users': 'bg-green-50 text-green-700',
};

export function NotificationsPage() {
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTarget, setComposeTarget] =
    useState<NotificationTarget>('All Users');
  const [composeDeepLink, setComposeDeepLink] = useState('');
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const totalSent = MOCK_NOTIFICATIONS.reduce(
    (sum, n) => sum + n.delivered,
    0
  );
  const totalDelivered = totalSent;
  const totalRead = MOCK_NOTIFICATIONS.reduce((sum, n) => sum + n.read, 0);
  const readRate =
    totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;
  const pendingCount = 2;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Notifications
          </h2>
          <p className="mt-1 text-text-secondary">
            Send push notifications and track delivery metrics
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Send size={16} />
          Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Mail size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {totalSent.toLocaleString()}
              </p>
              <p className="text-xs text-text-secondary">Total Sent</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {totalDelivered.toLocaleString()}
              </p>
              <p className="text-xs text-text-secondary">Delivered</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Eye size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{readRate}%</p>
              <p className="text-xs text-text-secondary">Read Rate</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {pendingCount}
              </p>
              <p className="text-xs text-text-secondary">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Section */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-text-primary">
            Compose Notification
          </h3>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Title
            </label>
            <input
              type="text"
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              placeholder="Notification title..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Body
            </label>
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Write your notification message..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Target + Deep Link Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target Selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                Target Audience
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-text-primary transition-colors hover:border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-text-secondary" />
                    {composeTarget}
                  </div>
                  <ChevronDown size={14} className="text-text-secondary" />
                </button>
                {showTargetDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    {TARGET_OPTIONS.map((target) => (
                      <button
                        key={target}
                        onClick={() => {
                          setComposeTarget(target);
                          setShowTargetDropdown(false);
                        }}
                        className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          composeTarget === target
                            ? 'font-semibold text-primary'
                            : 'text-text-primary'
                        }`}
                      >
                        {target}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Deep Link URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                Deep Link URL{' '}
                <span className="font-normal text-text-secondary">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={composeDeepLink}
                onChange={(e) => setComposeDeepLink(e.target.value)}
                placeholder="maa://courses/foundations"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end pt-2">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
              <Send size={15} />
              Send Now
            </button>
          </div>
        </div>
      </div>

      {/* Recent Notifications Table */}
      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            Recent Notifications
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Title
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Target
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Sent At
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Delivered
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Read
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_NOTIFICATIONS.map((notification) => {
                const notifReadRate =
                  notification.delivered > 0
                    ? Math.round(
                        (notification.read / notification.delivered) * 100
                      )
                    : 0;

                return (
                  <tr
                    key={notification.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {notification.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TARGET_STYLES[notification.target]}`}
                      >
                        {notification.target}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {notification.sentAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {notification.delivered.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary">
                          {notification.read.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-secondary">
                          ({notifReadRate}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
