import { NextResponse } from 'next/server'

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || 'key_977cd32665ec7400b5efd903b602f862c8e5b275bcb6c0ab5d7edcc3d6b1544d3f07c6f82727cf5f42fd674a30560312c31ef840ea39ec51e37364f3f0cdedf8'

export async function POST(request: Request) {
  try {
    const { image, prompt } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for video generation' },
        { status: 400 }
      )
    }

    if (!RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 500 }
      )
    }

    // Create generation request with Runway Gen-3
    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        prompt_image: image,
        prompt_text: prompt || 'Elegant fashion video with smooth camera movement',
        duration: 5,
        ratio: '16:9',
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Runway API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to start video generation: ' + errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Runway returns a task ID that we need to poll
    const taskId = data.id

    if (!taskId) {
      return NextResponse.json(
        { error: 'No task ID returned from Runway' },
        { status: 500 }
      )
    }

    // Return task ID for polling
    return NextResponse.json({ jobId: taskId })
  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      { error: 'Failed to generate video: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
