import type {
  VideoProvider,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoGenerationStatus,
} from './types'

/**
 * Runway Gen-3 Image-to-Video Provider
 *
 * Runway offers high-quality cinematic video generation from images.
 * This is the recommended primary provider for fashion content.
 */
export class RunwayProvider implements VideoProvider {
  name = 'Runway'
  private apiKey: string
  private baseUrl = 'https://api.dev.runwayml.com/v1'

  constructor() {
    const apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      throw new Error('RUNWAY_API_KEY is not configured')
    }
    this.apiKey = apiKey
  }

  async generate(input: VideoGenerationInput): Promise<VideoGenerationOutput> {
    const primaryImage = input.images[0]
    if (!primaryImage) {
      throw new Error('At least one image is required')
    }

    // Runway Gen-3 Image-to-Video endpoint
    const response = await fetch(`${this.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptImage: primaryImage,
        promptText: input.prompt,
        duration: input.duration || 5, // 5 or 10 seconds
        ratio: this.convertAspectRatio(input.aspectRatio),
        seed: input.seed,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Runway API error: ${error}`)
    }

    const data = await response.json()

    return {
      videoUrl: data.output?.[0] || '',
      jobId: data.id,
      metadata: {
        model: 'gen3a_turbo',
        taskId: data.id,
      },
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`)
      }

      const data = await response.json()

      let status: VideoGenerationStatus['status'] = 'processing'
      if (data.status === 'SUCCEEDED') status = 'completed'
      else if (data.status === 'FAILED') status = 'failed'
      else if (data.status === 'PENDING') status = 'queued'
      else if (data.status === 'RUNNING') status = 'processing'

      return {
        status,
        progress: data.progress ? Math.round(data.progress * 100) : undefined,
        videoUrl: data.output?.[0],
        error: data.failure,
        metadata: data,
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
      const response = await fetch(`${this.baseUrl}/tasks/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Convert aspect ratio string to Runway format
   */
  private convertAspectRatio(ratio?: string): string {
    const map: Record<string, string> = {
      '9:16': '768:1344',  // Vertical (Reels/TikTok)
      '16:9': '1344:768',  // Horizontal
      '1:1': '1024:1024',  // Square
      '4:5': '896:1120',   // Instagram portrait
    }
    return map[ratio || '9:16'] || '768:1344'
  }
}
