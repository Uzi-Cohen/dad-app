import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queueVideoGeneration } from '@/lib/queue'
import { z } from 'zod'
import type { AIProvider } from '@prisma/client'

const generateVideoSchema = z.object({
  productId: z.string().uuid(),
  inputAssetIds: z.array(z.string().uuid()).min(1),
  provider: z.enum(['REPLICATE', 'RUNWAY', 'FAL_PIKA', 'FAL_LUMA']).optional(),
  template: z.string().optional(),
  aspectRatio: z.string().default('9:16'),
  duration: z.number().min(3).max(10).default(6),
  customPrompt: z.string().optional(),
})

/**
 * POST /api/generate/video
 * Create a video generation job
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = generateVideoSchema.parse(body)

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        brand: {
          userId: user.id,
        },
      },
      include: {
        brand: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Verify assets exist and belong to product
    const assets = await prisma.asset.findMany({
      where: {
        id: { in: data.inputAssetIds },
        productId: data.productId,
        type: 'IMAGE',
      },
    })

    if (assets.length !== data.inputAssetIds.length) {
      return NextResponse.json(
        { error: 'One or more assets not found' },
        { status: 404 }
      )
    }

    // Build prompt
    const prompt = data.customPrompt || buildPrompt(product, data.template)
    const negativePrompt = product.brand.negativePrompt

    // Determine provider
    const provider: AIProvider = data.provider || 'RUNWAY'

    // Create generation job in database
    const generationJob = await prisma.generationJob.create({
      data: {
        productId: data.productId,
        provider,
        prompt,
        negativePrompt,
        aspectRatio: data.aspectRatio,
        videoDuration: data.duration,
        template: data.template,
        status: 'QUEUED',
        parameters: {
          inputAssetIds: data.inputAssetIds,
        },
      },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    })

    // Add to queue
    await queueVideoGeneration({
      generationId: generationJob.id,
      productId: data.productId,
      provider,
      inputAssetIds: data.inputAssetIds,
      prompt,
      negativePrompt,
      aspectRatio: data.aspectRatio,
      duration: data.duration,
      template: data.template,
    })

    // Link input assets to generation
    await prisma.generationJob.update({
      where: { id: generationJob.id },
      data: {
        inputAssets: {
          connect: data.inputAssetIds.map(id => ({ id })),
        },
      },
    })

    return NextResponse.json({
      job: generationJob,
      message: 'Video generation queued successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to queue video generation' },
      { status: 500 }
    )
  }
}

/**
 * Build prompt from product data and template
 */
function buildPrompt(product: any, template?: string): string {
  const brand = product.brand
  let basePrompt = brand.defaultPrompt

  // Add product-specific details
  const details: string[] = []
  if (product.fabric) details.push(`${product.fabric} fabric`)
  if (product.colors && product.colors.length > 0) {
    details.push(`in ${product.colors.join(' and ')}`)
  }

  const productContext = details.length > 0 ? `, ${details.join(', ')}` : ''

  // Add template modifiers
  let templateModifier = ''
  switch (template) {
    case 'runway-cinematic':
      templateModifier = ', cinematic slow push-in, dramatic lighting, luxury fashion showcase'
      break
    case 'mannequin-spin':
      templateModifier = ', slow 360-degree rotation, consistent lighting, showcase all angles'
      break
    case 'fabric-macro':
      templateModifier = ', macro closeup of fabric texture, gentle parallax, reveal fine details'
      break
    case 'runway-spotlight':
      templateModifier = ', runway spotlight, shallow depth of field, stage ambience, elegant presentation'
      break
    default:
      templateModifier = ''
  }

  return `${basePrompt}${productContext}${templateModifier}`
}
