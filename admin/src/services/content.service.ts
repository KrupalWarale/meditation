/**
 * File: content.service.ts
 *
 * Description: Content asset service for listing, uploading, and deleting media files
 * from Supabase storage buckets.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase';

export interface ContentAsset {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export async function getContentAssets(bucket: string): Promise<ContentAsset[]> {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    throw new Error(`Failed to list content: ${error.message}`);
  }

  return (data ?? []).map((file) => ({
    id: file.id ?? '',
    name: file.name,
    file_path: `${bucket}/${file.name}`,
    file_type: file.metadata?.mimetype ?? 'unknown',
    file_size: file.metadata?.size ?? 0,
    created_at: file.created_at ?? '',
  }));
}

export async function uploadContent(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function deleteContent(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
