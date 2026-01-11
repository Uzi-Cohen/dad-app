/**
 * Video Generation Provider Abstraction Layer
 *
 * This module provides a unified interface for multiple AI video generation services.
 * Providers can be swapped without changing application logic.
 *
 * Supported providers:
 * - Replicate (Stable Video Diffusion)
 * - Runway (Gen-3 Image-to-Video)
 * - Fal.ai Pika
 * - Fal.ai Luma Dream Machine
 */

export * from './types'
export * from './replicate'
export * from './runway'
export * from './fal'
export * from './factory'
export { getVideoProvider, VideoProviderFactory } from './factory'
