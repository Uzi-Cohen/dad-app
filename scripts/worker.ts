#!/usr/bin/env tsx

/**
 * Video Generation Worker
 *
 * This script runs the BullMQ worker that processes video generation jobs.
 * Run this in a separate process from the Next.js server.
 *
 * Usage:
 *   npm run worker
 *   or
 *   tsx scripts/worker.ts
 */

import { startVideoGenerationWorker } from '../lib/queue'

console.log('🚀 Starting video generation worker...')
console.log('📋 Worker will process jobs from the video-generation queue')
console.log('⏹️  Press Ctrl+C to stop\n')

const worker = startVideoGenerationWorker()

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...')
  await worker.close()
  process.exit(0)
})
