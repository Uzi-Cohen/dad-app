import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  brandId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  price: z.number().optional(),
  fabric: z.string().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED']).optional(),
})

/**
 * GET /api/products
 * List all products for the authenticated user's brands
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request)

    // Get user's brands
    const brands = await prisma.brand.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const brandIds = brands.map(b => b.id)

    // Get products
    const products = await prisma.product.findMany({
      where: {
        brandId: { in: brandIds },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        assets: {
          where: {
            role: 'HERO',
          },
          take: 1,
        },
        _count: {
          select: {
            assets: true,
            generations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Verify brand belongs to user
    const brand = await prisma.brand.findFirst({
      where: {
        id: data.brandId,
        userId: user.id,
      },
    })

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found or access denied' },
        { status: 404 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        brandId: data.brandId,
        sku: data.sku,
        name: data.name,
        price: data.price,
        fabric: data.fabric,
        colors: data.colors || [],
        sizes: data.sizes || [],
        status: data.status || 'DRAFT',
      },
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
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
