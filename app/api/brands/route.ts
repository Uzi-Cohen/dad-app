import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storage } from '@/lib/storage'
import { z } from 'zod'

const createBrandSchema = z.object({
  name: z.string(),
  logoBase64: z.string().optional(),
  watermarkPosition: z.enum(['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']).optional(),
  watermarkOpacity: z.number().min(0).max(1).optional(),
  defaultPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
})

/**
 * GET /api/brands
 * Get all brands for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request)

    const brands = await prisma.brand.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ brands })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brands
 * Create a new brand
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = createBrandSchema.parse(body)

    // Upload logo if provided
    let logoUrl: string | undefined
    if (data.logoBase64) {
      const uploadedLogo = await storage.uploadFromBase64(data.logoBase64, 'logos')
      logoUrl = uploadedLogo.url
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        userId: user.id,
        name: data.name,
        logoUrl,
        watermarkPosition: data.watermarkPosition,
        watermarkOpacity: data.watermarkOpacity,
        defaultPrompt: data.defaultPrompt,
        negativePrompt: data.negativePrompt,
      },
    })

    return NextResponse.json({ brand })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create brand' },
      { status: 500 }
    )
  }
}
