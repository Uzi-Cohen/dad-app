/**
 * Provider Abstraction Layer Types
 *
 * This defines the interface all video generation providers must implement.
 * Providers can be swapped without changing UI or business logic.
 */

export interface VideoGenerationInput {
  images: string[]              // Base64 or URLs
  prompt: string
  negativePrompt?: string
  duration?: number             // in seconds
  aspectRatio?: string          // "9:16" | "1:1" | "4:5"
  template?: string             // Template identifier
  fps?: number
  seed?: number
}

export interface VideoGenerationOutput {
  videoUrl: string
  jobId?: string                // Provider's job ID for tracking
  metadata?: Record<string, any>
}

export interface VideoGenerationStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number             // 0-100
  videoUrl?: string
  error?: string
  metadata?: Record<string, any>
}

export interface VideoProvider {
  name: string

  /**
   * Start a video generation job
   */
  generate(input: VideoGenerationInput): Promise<VideoGenerationOutput>

  /**
   * Check the status of a generation job (for async providers)
   */
  getStatus?(jobId: string): Promise<VideoGenerationStatus>

  /**
   * Cancel a running job (if supported)
   */
  cancel?(jobId: string): Promise<boolean>
}

export type ProviderType = 'replicate' | 'runway' | 'fal-pika' | 'fal-luma'
