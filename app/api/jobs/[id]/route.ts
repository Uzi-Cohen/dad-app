import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getJobStatus, cancelJob } from '@/lib/queue'

/**
 * GET /api/jobs/:id
 * Get job status and details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Get job from database
    const job = await prisma.generationJob.findFirst({
      where: {
        id: params.id,
        product: {
          brand: {
            userId: user.id,
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        outputAsset: true,
        inputAssets: true,
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get queue status if job is still processing
    let queueStatus = null
    if (job.status === 'QUEUED' || job.status === 'RUNNING') {
      queueStatus = await getJobStatus(params.id)
    }

    return NextResponse.json({
      job,
      queueStatus,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/:id
 * Cancel a job
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify job belongs to user
    const job = await prisma.generationJob.findFirst({
      where: {
        id: params.id,
        product: {
          brand: {
            userId: user.id,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Can only cancel queued or running jobs
    if (job.status !== 'QUEUED' && job.status !== 'RUNNING') {
      return NextResponse.json(
        { error: 'Job cannot be cancelled' },
        { status: 400 }
      )
    }

    // Cancel in queue
    await cancelJob(params.id)

    // Update in database
    await prisma.generationJob.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        error: 'Cancelled by user',
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel job' },
      { status: 500 }
    )
  }
}
