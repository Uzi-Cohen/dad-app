import type { VideoProvider, ProviderType } from './types'
import { ReplicateProvider } from './replicate'
import { RunwayProvider } from './runway'
import { FalPikaProvider, FalLumaProvider } from './fal'

/**
 * Provider Factory
 *
 * Creates the appropriate video generation provider based on type.
 * Handles provider initialization and configuration.
 */
export class VideoProviderFactory {
  private static instances: Map<ProviderType, VideoProvider> = new Map()

  /**
   * Get a video provider instance (singleton per type)
   */
  static getProvider(type: ProviderType): VideoProvider {
    if (!this.instances.has(type)) {
      this.instances.set(type, this.createProvider(type))
    }
    return this.instances.get(type)!
  }

  /**
   * Create a new provider instance
   */
  private static createProvider(type: ProviderType): VideoProvider {
    switch (type) {
      case 'replicate':
        return new ReplicateProvider()
      case 'runway':
        return new RunwayProvider()
      case 'fal-pika':
        return new FalPikaProvider()
      case 'fal-luma':
        return new FalLumaProvider()
      default:
        throw new Error(`Unknown provider type: ${type}`)
    }
  }

  /**
   * Get the default provider (with fallback logic)
   */
  static getDefaultProvider(): VideoProvider {
    // Priority order: Runway > Fal Pika > Replicate > Fal Luma
    const providers: ProviderType[] = ['runway', 'fal-pika', 'replicate', 'fal-luma']

    for (const providerType of providers) {
      try {
        return this.getProvider(providerType)
      } catch (error) {
        // Provider not configured, try next
        console.warn(`Provider ${providerType} not available:`, error)
      }
    }

    throw new Error('No video generation provider is configured')
  }

  /**
   * Get available providers (those with API keys configured)
   */
  static getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = ['replicate', 'runway', 'fal-pika', 'fal-luma']
    return providers.filter(type => {
      try {
        this.getProvider(type)
        return true
      } catch {
        return false
      }
    })
  }

  /**
   * Check if a specific provider is available
   */
  static isProviderAvailable(type: ProviderType): boolean {
    try {
      this.getProvider(type)
      return true
    } catch {
      return false
    }
  }

  /**
   * Clear cached instances (useful for testing)
   */
  static clearCache(): void {
    this.instances.clear()
  }
}

/**
 * Convenience function to get a provider
 */
export function getVideoProvider(type?: ProviderType): VideoProvider {
  if (type) {
    return VideoProviderFactory.getProvider(type)
  }
  return VideoProviderFactory.getDefaultProvider()
}
