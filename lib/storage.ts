import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Storage Service
 *
 * Handles file uploads with support for:
 * - Local filesystem (development)
 * - S3-compatible storage (production)
 */

export interface StorageFile {
  filename: string
  url: string
  path: string
  size: number
  mimeType: string
}

export class StorageService {
  private storageType: 'local' | 's3'
  private storagePath: string
  private baseUrl: string

  constructor() {
    this.storageType = (process.env.STORAGE_TYPE as 'local' | 's3') || 'local'
    this.storagePath = process.env.STORAGE_PATH || './uploads'
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: File | Buffer,
    folder: 'images' | 'videos' | 'logos' | 'temp',
    originalName?: string
  ): Promise<StorageFile> {
    if (this.storageType === 'local') {
      return this.uploadToLocal(file, folder, originalName)
    } else {
      return this.uploadToS3(file, folder, originalName)
    }
  }

  /**
   * Upload from base64 string
   */
  async uploadFromBase64(
    base64Data: string,
    folder: 'images' | 'videos' | 'logos' | 'temp',
    filename?: string
  ): Promise<StorageFile> {
    // Extract mime type and data
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 data')
    }

    const mimeType = matches[1]
    const data = matches[2]
    const buffer = Buffer.from(data, 'base64')

    // Generate filename if not provided
    const extension = this.getExtensionFromMimeType(mimeType)
    const finalFilename = filename || `${randomUUID()}.${extension}`

    return this.uploadFile(buffer, folder, finalFilename)
  }

  /**
   * Upload from URL (download and store)
   */
  async uploadFromUrl(
    url: string,
    folder: 'images' | 'videos' | 'logos' | 'temp',
    filename?: string
  ): Promise<StorageFile> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const extension = this.getExtensionFromMimeType(contentType)
    const finalFilename = filename || `${randomUUID()}.${extension}`

    return this.uploadFile(buffer, folder, finalFilename)
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (this.storageType === 'local') {
      return this.deleteFromLocal(filePath)
    } else {
      return this.deleteFromS3(filePath)
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    file: File | Buffer,
    folder: string,
    originalName?: string
  ): Promise<StorageFile> {
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', this.storagePath, folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const extension = originalName ? originalName.split('.').pop() : 'bin'
    const filename = `${randomUUID()}.${extension}`
    const filepath = join(uploadDir, filename)

    // Get buffer from file or use directly
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer())

    // Write file
    await writeFile(filepath, buffer)

    // Determine mime type
    let mimeType = 'application/octet-stream'
    if (file instanceof File) {
      mimeType = file.type
    } else if (originalName) {
      mimeType = this.getMimeTypeFromExtension(extension || '')
    }

    return {
      filename,
      url: `${this.baseUrl}/${this.storagePath}/${folder}/${filename}`,
      path: `${this.storagePath}/${folder}/${filename}`,
      size: buffer.length,
      mimeType,
    }
  }

  /**
   * Upload to S3 (placeholder - implement when needed)
   */
  private async uploadToS3(
    file: File | Buffer,
    folder: string,
    originalName?: string
  ): Promise<StorageFile> {
    // TODO: Implement S3 upload using AWS SDK
    // For now, fall back to local
    console.warn('S3 upload not implemented yet, falling back to local storage')
    return this.uploadToLocal(file, folder, originalName)
  }

  /**
   * Delete from local filesystem
   */
  private async deleteFromLocal(filePath: string): Promise<boolean> {
    try {
      const { unlink } = await import('fs/promises')
      const fullPath = join(process.cwd(), 'public', filePath)
      await unlink(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Delete from S3 (placeholder)
   */
  private async deleteFromS3(filePath: string): Promise<boolean> {
    // TODO: Implement S3 delete
    console.warn('S3 delete not implemented yet')
    return false
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    }
    return map[mimeType] || 'bin'
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    }
    return map[extension.toLowerCase()] || 'application/octet-stream'
  }
}

// Singleton instance
export const storage = new StorageService()
