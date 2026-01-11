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

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    let output

    if (referenceImage) {
      // Use img2img for reference-based generation (maintains consistency)
      output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            image: referenceImage,
            prompt: prompt || "high quality fashion photography, detailed dress design, professional lighting",
            refine: "expert_ensemble_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "low quality, blurry, distorted, malformed, amateur",
            prompt_strength: 0.8,
            num_inference_steps: 40,
          },
        }
      )
    } else {
      // Use text2img for pure text-based generation
      output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: `${prompt}, high quality fashion photography, detailed dress design, professional lighting, studio shot`,
            refine: "expert_ensemble_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "low quality, blurry, distorted, malformed, amateur, naked, nude",
            num_inference_steps: 40,
          },
        }
      )
    }

    // Replicate returns an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
