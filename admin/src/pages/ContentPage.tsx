/**
 * File: ContentPage.tsx
 *
 * Description: Content directory management for bhajans, meditations, and satsangs.
 *
 * Author: Navnit(Ninjacode911)
 */

import { FolderOpen, Upload, Grid, List } from 'lucide-react';

export function ContentPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Content Directory
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage media and content assets. Full implementation coming in Phase 2.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200">
            <button className="rounded-l-lg bg-primary/10 px-3 py-2 text-primary">
              <Grid size={16} />
            </button>
            <button className="rounded-r-lg px-3 py-2 text-text-secondary hover:bg-gray-50">
              <List size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-surface p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen size={32} className="text-primary" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary">
            Content Library
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
            Upload and manage audio files, images, and other media assets for your meditation courses
            and lessons. Content management will be available after backend integration.
          </p>
        </div>
      </div>
    </div>
  );
}
