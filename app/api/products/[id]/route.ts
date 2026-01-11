import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  fabric: z.string().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED']).optional(),
})

/**
 * GET /api/products/:id
 * Get a single product with all details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        brand: {
          userId: user.id,
        },
      },
      include: {
        brand: true,
        assets: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        generations: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            outputAsset: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/:id
 * Update a product
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = updateProductSchema.parse(body)

    // Verify product belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        brand: {
          userId: user.id,
        },
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: {
        brand: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product
 */
export async function DELETE(
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

    // Delete product (cascade will delete related assets and generations)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    )
  }
}
