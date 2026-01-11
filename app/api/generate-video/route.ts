import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: Request) {
  try {
    const { prompt, referenceImage } = await request.json()

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    if (!referenceImage) {
      return NextResponse.json(
        { error: 'Reference image is required for video generation' },
        { status: 400 }
      )
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Use Stable Video Diffusion for image-to-video
    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          input_image: referenceImage,
          cond_aug: 0.02,
          decoding_t: 14,
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          frames_per_second: 6,
        },
      }
    )

    // The output is a video URL
    const videoUrl = output

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    )
  }
}
