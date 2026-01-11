import { NextResponse } from 'next/server'
import RunwayML from '@runwayml/sdk'

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

    // Initialize Runway client
    const client = new RunwayML({ apiKey: RUNWAY_API_KEY })

    // Ensure image is in data URI format
    const imageUri = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    console.log('Starting video generation with Runway Gen-4 Turbo...')

    // Create image-to-video task
    const task = await client.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage: [
        {
          uri: imageUri,
          position: 'first'
        }
      ],
      promptText: prompt || 'Camera slowly moves horizontally, smooth cinematic movement',
      duration: 5,
      ratio: '1280:720',
    })

    console.log('Task created:', task.id)

    // Return task ID for polling
    return NextResponse.json({
      jobId: task.id,
      message: 'Video generation started'
    })
  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate video: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
