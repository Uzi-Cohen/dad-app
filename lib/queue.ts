import { Queue, Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { prisma } from './prisma'
import { getVideoProvider } from './providers'
import { storage } from './storage'
import type { AIProvider } from '@prisma/client'

/**
 * Job Queue System
 *
 * Handles background processing of video generation jobs using BullMQ and Redis.
 */

// Redis connection
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

/**
 * Video generation job data
 */
export interface VideoGenerationJobData {
  generationId: string
  productId: string
  provider: AIProvider
  inputAssetIds: string[]
  prompt: string
  negativePrompt?: string
  aspectRatio: string
  duration: number
  template?: string
}

/**
 * Video generation queue
 */
export const videoGenerationQueue = new Queue<VideoGenerationJobData>('video-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
})

/**
 * Add a video generation job to the queue
 */
export async function queueVideoGeneration(data: VideoGenerationJobData): Promise<string> {
  const job = await videoGenerationQueue.add('generate-video', data, {
    jobId: data.generationId,
  })
  return job.id!
}

/**
 * Video generation worker
 *
 * This processes video generation jobs in the background.
 */
export function startVideoGenerationWorker() {
  const worker = new Worker<VideoGenerationJobData>(
    'video-generation',
    async (job: Job<VideoGenerationJobData>) => {
      const { generationId, provider, inputAssetIds, prompt, negativePrompt, aspectRatio, duration } = job.data

      try {
        // Update job status to RUNNING
        await prisma.generationJob.update({
          where: { id: generationId },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
          },
        })

        // Get input assets
        const inputAssets = await prisma.asset.findMany({
          where: {
            id: { in: inputAssetIds },
          },
        })

        if (inputAssets.length === 0) {
          throw new Error('No input assets found')
        }

        // Get the video provider
        const providerType = provider.toLowerCase().replace('_', '-') as any
        const videoProvider = getVideoProvider(providerType)

        // Generate video
        job.updateProgress(10)
        const result = await videoProvider.generate({
          images: inputAssets.map(a => a.url),
          prompt,
          negativePrompt,
          aspectRatio,
          duration,
        })

        job.updateProgress(60)

        // Download and store the generated video
        const videoFile = await storage.uploadFromUrl(
          result.videoUrl,
          'videos',
          `${generationId}.mp4`
        )

        job.updateProgress(80)

        // Create output asset
        const outputAsset = await prisma.asset.create({
          data: {
            productId: job.data.productId,
            type: 'VIDEO',
            role: 'OUTPUT',
            url: videoFile.url,
            filename: videoFile.filename,
            mimeType: videoFile.mimeType,
            size: videoFile.size,
            metadata: result.metadata,
          },
        })

        // Update generation job
        await prisma.generationJob.update({
          where: { id: generationId },
          data: {
            status: 'COMPLETED',
            outputAssetId: outputAsset.id,
            providerJobId: result.jobId,
            completedAt: new Date(),
            metadata: result.metadata,
          },
        })

        job.updateProgress(100)

        return {
          success: true,
          outputAssetId: outputAsset.id,
          videoUrl: videoFile.url,
        }
      } catch (error) {
        // Update job status to FAILED
        await prisma.generationJob.update({
          where: { id: generationId },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          },
        })

        throw error
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Process 2 videos at a time
      limiter: {
        max: 10, // Max 10 jobs
        duration: 60000, // Per minute
      },
    }
  )

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`✅ Video generation completed: ${job.id}`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Video generation failed: ${job?.id}`, err.message)
  })

  worker.on('error', (err) => {
    console.error('Worker error:', err)
  })

  return worker
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<{
  status: string
  progress: number
  result?: any
  error?: string
}> {
  const job = await videoGenerationQueue.getJob(jobId)

  if (!job) {
    return {
      status: 'not_found',
      progress: 0,
    }
  }

  const state = await job.getState()
  const progress = job.progress as number || 0

  return {
    status: state,
    progress,
    result: job.returnvalue,
    error: job.failedReason,
  }
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  try {
    const job = await videoGenerationQueue.getJob(jobId)
    if (job) {
      await job.remove()
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    videoGenerationQueue.getWaitingCount(),
    videoGenerationQueue.getActiveCount(),
    videoGenerationQueue.getCompletedCount(),
    videoGenerationQueue.getFailedCount(),
  ])

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  }
}

/**
 * Graceful shutdown
 */
export async function closeQueue() {
  await videoGenerationQueue.close()
  await redisConnection.quit()
}
