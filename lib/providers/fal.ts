import * as fal from '@fal-ai/client'
import type {
  VideoProvider,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoGenerationStatus,
} from './types'

/**
 * Fal.ai Provider Base Class
 *
 * Fal.ai hosts multiple video models including Pika and Luma.
 * This base class handles common logic.
 */
abstract class FalProviderBase implements VideoProvider {
  abstract name: string
  protected abstract modelId: string

  constructor() {
    const apiKey = process.env.FAL_API_KEY
    if (!apiKey) {
      throw new Error('FAL_API_KEY is not configured')
    }
    fal.config({
      credentials: apiKey,
    })
  }

  async generate(input: VideoGenerationInput): Promise<VideoGenerationOutput> {
    const primaryImage = input.images[0]
    if (!primaryImage) {
      throw new Error('At least one image is required')
    }

    const result = await fal.subscribe(this.modelId, {
      input: this.prepareInput(input),
      logs: false,
    })

    return {
      videoUrl: result.data.video?.url || result.data.output?.url || '',
      jobId: result.requestId,
      metadata: {
        model: this.modelId,
        requestId: result.requestId,
        data: result.data,
      },
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationStatus> {
    try {
      const status = await fal.queue.status(this.modelId, {
        requestId: jobId,
        logs: false,
      })

      let statusType: VideoGenerationStatus['status'] = 'processing'
      if (status.status === 'COMPLETED') statusType = 'completed'
      else if (status.status === 'FAILED') statusType = 'failed'
      else if (status.status === 'IN_QUEUE') statusType = 'queued'
      else if (status.status === 'IN_PROGRESS') statusType = 'processing'

      return {
        status: statusType,
        metadata: status,
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async cancel(jobId: string): Promise<boolean> {
    try {
      await fal.queue.cancel(this.modelId, { requestId: jobId })
      return true
    } catch {
      return false
    }
  }

  /**
   * Prepare input for the specific model
   * Override this in subclasses for model-specific parameters
   */
  protected abstract prepareInput(input: VideoGenerationInput): Record<string, any>
}

/**
 * Pika Image-to-Video via Fal.ai
 *
 * Good for quick iterations and "social media style" clips
 */
export class FalPikaProvider extends FalProviderBase {
  name = 'Fal.ai Pika'
  protected modelId = 'fal-ai/pika/image-to-video'

  protected prepareInput(input: VideoGenerationInput) {
    return {
      image_url: input.images[0],
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      aspect_ratio: input.aspectRatio || '9:16',
      num_frames: Math.min((input.duration || 3) * 24, 72), // Pika uses 24 fps
      guidance_scale: 7.5,
      num_inference_steps: 25,
    }
  }
}

/**
 * Luma Dream Machine Image-to-Video via Fal.ai
 *
 * Strong photorealistic tendencies, great for product shots
 */
export class FalLumaProvider extends FalProviderBase {
  name = 'Fal.ai Luma'
  protected modelId = 'fal-ai/luma-dream-machine/image-to-video'

  protected prepareInput(input: VideoGenerationInput) {
    return {
      image_url: input.images[0],
      prompt: input.prompt,
      aspect_ratio: this.convertAspectRatio(input.aspectRatio),
      loop: false,
    }
  }

  private convertAspectRatio(ratio?: string): string {
    const map: Record<string, string> = {
      '9:16': '9:16',
      '16:9': '16:9',
      '1:1': '1:1',
      '4:3': '4:3',
      '3:4': '3:4',
      '21:9': '21:9',
      '9:21': '9:21',
    }
    return map[ratio || '9:16'] || '9:16'
  }
}
