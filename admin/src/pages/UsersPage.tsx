/**
 * File: UsersPage.tsx
 *
 * Description: User management page with search, filter, and user data table.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Users, Search, Filter } from 'lucide-react';

export function UsersPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            User Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage users. Full implementation coming in Phase 2.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Users size={16} />
          Export Users
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search users..."
              disabled
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
          <button disabled className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-text-secondary">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                  User data will be displayed here once backend integration is complete.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
