import Replicate from 'replicate'
import type {
  VideoProvider,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoGenerationStatus,
} from './types'

export class ReplicateProvider implements VideoProvider {
  name = 'Replicate'
  private client: Replicate

  constructor() {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured')
    }
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  }

  async generate(input: VideoGenerationInput): Promise<VideoGenerationOutput> {
    const primaryImage = input.images[0]
    if (!primaryImage) {
      throw new Error('At least one image is required')
    }

    // Use Stable Video Diffusion for image-to-video
    const output = await this.client.run(
      'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      {
        input: {
          input_image: primaryImage,
          cond_aug: 0.02,
          decoding_t: 14,
          video_length: '14_frames_with_svd',
          sizing_strategy: 'maintain_aspect_ratio',
          motion_bucket_id: 127,
          frames_per_second: input.fps || 6,
        },
      }
    )

    return {
      videoUrl: output as string,
      metadata: {
        model: 'stable-video-diffusion',
        frames: 14,
        fps: input.fps || 6,
      },
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationStatus> {
    try {
      const prediction = await this.client.predictions.get(jobId)

      let status: VideoGenerationStatus['status'] = 'processing'
      if (prediction.status === 'succeeded') status = 'completed'
      else if (prediction.status === 'failed' || prediction.status === 'canceled') status = 'failed'
      else if (prediction.status === 'starting') status = 'queued'

      return {
        status,
        videoUrl: prediction.output as string | undefined,
        error: prediction.error as string | undefined,
        metadata: prediction,
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
      await this.client.predictions.cancel(jobId)
      return true
    } catch {
      return false
    }
  }
}
