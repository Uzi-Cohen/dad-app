import { NextResponse } from 'next/server'
import RunwayML from '@runwayml/sdk'

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || 'key_977cd32665ec7400b5efd903b602f862c8e5b275bcb6c0ab5d7edcc3d6b1544d3f07c6f82727cf5f42fd674a30560312c31ef840ea39ec51e37364f3f0cdedf8'

/**
 * GET /api/jobs/:id
 * Check Runway task status using SDK
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    // Initialize Runway client
    const client = new RunwayML({ apiKey: RUNWAY_API_KEY })

    // Retrieve task status
    const task = await client.tasks.retrieve(taskId)

    console.log('Task status:', task.status, 'Progress:', task.progress)

    // Map Runway status to our format
    let status = 'RUNNING'
    let outputUrl = null

    if (task.status === 'SUCCEEDED') {
      status = 'COMPLETED'
      // Get the output video URL
      outputUrl = task.output?.[0] || null
    } else if (task.status === 'FAILED') {
      status = 'FAILED'
    } else if (task.status === 'PENDING' || task.status === 'RUNNING') {
      status = 'RUNNING'
    } else if (task.status === 'CANCELLED') {
      status = 'CANCELLED'
    }

    return NextResponse.json({
      job: {
        id: taskId,
        status,
        outputUrl,
        progress: task.progress || 0,
        error: task.failure || null,
      },
    })
  } catch (error) {
    console.error('Error checking job status:', error)
    return NextResponse.json(
      {
        error: 'Failed to check job status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/:id
 * Cancel a Runway task using SDK
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    // Initialize Runway client
    const client = new RunwayML({ apiKey: RUNWAY_API_KEY })

    // Cancel the task
    await client.tasks.cancel(taskId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling job:', error)
    return NextResponse.json(
      { error: 'Failed to cancel job: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
