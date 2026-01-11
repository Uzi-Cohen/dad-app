import { NextResponse } from 'next/server'

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || 'key_977cd32665ec7400b5efd903b602f862c8e5b275bcb6c0ab5d7edcc3d6b1544d3f07c6f82727cf5f42fd674a30560312c31ef840ea39ec51e37364f3f0cdedf8'

/**
 * GET /api/jobs/:id
 * Check Runway job status
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    // Poll Runway API for task status
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Runway API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to check job status' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Map Runway status to our format
    let status = 'RUNNING'
    let outputUrl = null

    if (data.status === 'SUCCEEDED') {
      status = 'COMPLETED'
      outputUrl = data.output?.[0] || data.output // Runway returns video URL in output
    } else if (data.status === 'FAILED') {
      status = 'FAILED'
    } else if (data.status === 'PENDING' || data.status === 'RUNNING') {
      status = 'RUNNING'
    }

    return NextResponse.json({
      job: {
        id: taskId,
        status,
        outputUrl,
        progress: data.progress || 0,
        error: data.failure || null,
      },
    })
  } catch (error) {
    console.error('Error checking job status:', error)
    return NextResponse.json(
      { error: 'Failed to check job status: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/:id
 * Cancel a Runway job
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to cancel job' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    )
  }
}
