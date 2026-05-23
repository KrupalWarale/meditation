/**
 * File: SettingsPage.tsx
 *
 * Description: Admin panel settings and configuration page.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Settings, Shield, Palette, Globe, Database } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function SettingsSection({ title, description, icon }: SettingsSectionProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <span className="text-primary">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
        <button
          disabled
          className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Configure
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-primary">
          Settings
        </h2>
        <p className="mt-1 text-text-secondary">
          Manage application settings. Full implementation coming in Phase 2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingsSection
          title="General Settings"
          description="Configure app name, description, default language, and timezone settings."
          icon={<Settings size={20} />}
        />
        <SettingsSection
          title="Security"
          description="Manage admin roles, permissions, two-factor authentication, and session policies."
          icon={<Shield size={20} />}
        />
        <SettingsSection
          title="Appearance"
          description="Customize the app theme, logo, colors, and branding elements."
          icon={<Palette size={20} />}
        />
        <SettingsSection
          title="Localization"
          description="Configure supported languages, regions, and content translation settings."
          icon={<Globe size={20} />}
        />
        <SettingsSection
          title="Database"
          description="View database health, manage backups, and configure data retention policies."
          icon={<Database size={20} />}
        />
      </div>
    </div>
  );
}
