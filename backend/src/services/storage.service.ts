/**
 * File: storage.service.ts
 *
 * Description: Provides file management operations for Supabase Storage buckets, including
 * media upload with upsert support, signed URL generation for private file access, and
 * file deletion.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase.service';

interface UploadResult {
  path: string;
  fullPath: string;
}

interface SignedUrlResult {
  signedUrl: string;
}

export const storageService = {
  /**
   * Upload media file to Supabase Storage bucket
   */
  async uploadMedia(
    file: Buffer,
    fileName: string,
    bucket: string
  ): Promise<UploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      console.error('uploadMedia error:', error);
      throw new Error(`Failed to upload media: ${error.message}`);
    }

    return {
      path: data.path,
      fullPath: `${bucket}/${data.path}`,
    };
  },

  /**
   * Get a signed URL for accessing a private file
   */
  async getSignedUrl(
    path: string,
    bucket: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('getSignedUrl error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return { signedUrl: data.signedUrl };
  },

  /**
   * Delete a file from Supabase Storage bucket
   */
  async deleteMedia(path: string, bucket: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('deleteMedia error:', error);
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  },
};
