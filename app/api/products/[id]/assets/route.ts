import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storage } from '@/lib/storage'
import { z } from 'zod'

const uploadAssetSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  role: z.enum(['HERO', 'DETAIL', 'OUTPUT', 'REFERENCE']),
  base64Data: z.string(),
  filename: z.string().optional(),
})

/**
 * GET /api/products/:id/assets
 * Get all assets for a product
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        brand: {
          userId: user.id,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get assets
    const assets = await prisma.asset.findMany({
      where: {
        productId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ assets })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/:id/assets
 * Upload a new asset (image or video)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = uploadAssetSchema.parse(body)

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        brand: {
          userId: user.id,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Upload file
    const folder = data.type === 'IMAGE' ? 'images' : 'videos'
    const uploadedFile = await storage.uploadFromBase64(
      data.base64Data,
      folder,
      data.filename
    )

    // Create asset record
    const asset = await prisma.asset.create({
      data: {
        productId: params.id,
        type: data.type,
        role: data.role,
        url: uploadedFile.url,
        filename: uploadedFile.filename,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
      },
    })

    return NextResponse.json({ asset })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload asset' },
      { status: 500 }
    )
  }
}
