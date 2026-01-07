import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload agency logo to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID (from auth.uid())
 * @param agencyId - Optional agency ID for existing agencies
 * @returns Public URL of the uploaded file
 */
export async function uploadAgencyLogo(
  file: File,
  userId: string,
  agencyId?: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: '',
      path: '',
      error: 'Invalid file type. Please upload a PNG, JPG, or WebP image.',
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: '',
      path: '',
      error: 'File size exceeds 5MB limit. Please upload a smaller image.',
    };
  }

  try {
    // Generate unique filename: {user_id}/{agency_id or timestamp}-{originalFilename}
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = agencyId
      ? `${agencyId}-${timestamp}.${fileExt}`
      : `${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to storage
    const { error } = await supabase.storage
      .from('agency-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        url: '',
        path: '',
        error: error.message || 'Failed to upload image. Please try again.',
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('agency-logos').getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (err: any) {
    console.error('Upload error:', err);
    return {
      url: '',
      path: '',
      error: err.message || 'An unexpected error occurred during upload.',
    };
  }
}

/**
 * Delete agency logo from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export async function deleteAgencyLogo(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('agency-logos')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
}

