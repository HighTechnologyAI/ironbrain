// File storage management using Cloudinary
// Cloudinary offers generous free tier: 25 GB storage, 25 GB bandwidth per month

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  publicId: string;
  uploadedBy: string;
  uploadedAt: Date;
  taskId?: string;
}

class FileStorageService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;
  private useCloudinary: boolean;

  constructor() {
    // These would normally come from environment variables
    this.cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'ironbrain-demo';
    this.uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ironbrain_uploads';
    this.apiKey = process.env.VITE_CLOUDINARY_API_KEY || '';
    
    // Use Cloudinary if properly configured, otherwise use local storage simulation
    this.useCloudinary = !!(this.cloudName && this.uploadPreset && this.cloudName !== 'ironbrain-demo');
    
    if (!this.useCloudinary) {
      console.log('Cloudinary not configured, using local storage simulation');
    }
  }

  /**
   * Upload file to Cloudinary or simulate local storage
   */
  async uploadFile(file: File, taskId?: string): Promise<UploadResult> {
    try {
      if (this.useCloudinary) {
        return await this.uploadToCloudinary(file, taskId);
      } else {
        return await this.simulateLocalUpload(file, taskId);
      }
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(file: File, taskId?: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    // Add context for better organization
    if (taskId) {
      formData.append('context', `task_id=${taskId}`);
      formData.append('folder', `tasks/${taskId}`);
    } else {
      formData.append('folder', 'general');
    }

    // Add tags for better management
    formData.append('tags', 'ironbrain,crm,task-attachment');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Simulate local file upload (for demo purposes)
   */
  private async simulateLocalUpload(file: File, taskId?: string): Promise<UploadResult> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Create a simulated URL using File API
    const fileUrl = URL.createObjectURL(file);
    const publicId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store file reference in localStorage for demo
    const fileData = {
      publicId,
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      taskId,
      uploadedAt: new Date().toISOString()
    };

    const existingFiles = JSON.parse(localStorage.getItem('ironbrain_uploaded_files') || '[]');
    existingFiles.push(fileData);
    localStorage.setItem('ironbrain_uploaded_files', JSON.stringify(existingFiles));

    return {
      success: true,
      url: fileUrl,
      publicId: publicId,
    };
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      // For deletion, we need to use the admin API which requires server-side implementation
      // For now, we'll simulate deletion (in production, this would be handled by backend)
      console.log(`File deletion requested for: ${publicId}`);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Generate optimized URL for file display
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    const transformString = transformations.length > 0 ? `/${transformations.join(',')}` : '';
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload${transformString}/${publicId}`;
  }

  /**
   * Get file info from URL
   */
  getFileInfoFromUrl(url: string): { publicId: string; isCloudinary: boolean } {
    const cloudinaryPattern = new RegExp(`https://res\\.cloudinary\\.com/${this.cloudName}/`);
    
    if (!cloudinaryPattern.test(url)) {
      return { publicId: '', isCloudinary: false };
    }

    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return { publicId: '', isCloudinary: false };
    }

    // Skip transformation parameters and get the public_id
    let publicIdParts = parts.slice(uploadIndex + 1);
    
    // Remove transformation parameters (they start with letters like 'w_', 'h_', etc.)
    while (publicIdParts.length > 0 && publicIdParts[0].includes('_')) {
      publicIdParts.shift();
    }

    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension
    
    return { publicId, isCloudinary: true };
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }
}

// Singleton instance
export const fileStorage = new FileStorageService();

// Local storage for file metadata (in production, this would be in database)
class FileMetadataService {
  private storageKey = 'ironbrain_file_metadata';

  saveFileMetadata(metadata: FileMetadata): void {
    const existing = this.getAllFileMetadata();
    existing.push(metadata);
    localStorage.setItem(this.storageKey, JSON.stringify(existing));
  }

  getFileMetadata(id: string): FileMetadata | null {
    const all = this.getAllFileMetadata();
    return all.find(file => file.id === id) || null;
  }

  getAllFileMetadata(): FileMetadata[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  getFilesByTask(taskId: string): FileMetadata[] {
    return this.getAllFileMetadata().filter(file => file.taskId === taskId);
  }

  deleteFileMetadata(id: string): void {
    const existing = this.getAllFileMetadata();
    const filtered = existing.filter(file => file.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
}

export const fileMetadata = new FileMetadataService();

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  return '📎';
};

export type { UploadResult, FileMetadata };

