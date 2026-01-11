import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storage } from '@/lib/storage'
import { z } from 'zod'

const updateBrandSchema = z.object({
  name: z.string().optional(),
  logoBase64: z.string().optional(),
  watermarkPosition: z.enum(['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']).optional(),
  watermarkOpacity: z.number().min(0).max(1).optional(),
  defaultPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
})

/**
 * GET /api/brands/:id
 * Get a single brand
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const brand = await prisma.brand.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ brand })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/brands/:id
 * Update a brand
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = updateBrandSchema.parse(body)

    // Verify brand belongs to user
    const existingBrand = await prisma.brand.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Upload new logo if provided
    let logoUrl: string | undefined
    if (data.logoBase64) {
      const uploadedLogo = await storage.uploadFromBase64(data.logoBase64, 'logos')
      logoUrl = uploadedLogo.url
    }

    // Update brand
    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(logoUrl && { logoUrl }),
        ...(data.watermarkPosition && { watermarkPosition: data.watermarkPosition }),
        ...(data.watermarkOpacity !== undefined && { watermarkOpacity: data.watermarkOpacity }),
        ...(data.defaultPrompt && { defaultPrompt: data.defaultPrompt }),
        ...(data.negativePrompt && { negativePrompt: data.negativePrompt }),
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
      { error: error instanceof Error ? error.message : 'Failed to update brand' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/brands/:id
 * Delete a brand
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify brand belongs to user
    const brand = await prisma.brand.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Delete brand (cascade will delete products, assets, etc.)
    await prisma.brand.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
