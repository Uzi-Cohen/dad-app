'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface VideoGeneratorProps {
  onVideoGenerated: (videoUrl: string) => void
}

export default function VideoGenerator({ onVideoGenerated }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferenceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt && !referenceImage) {
      setError('Please provide a prompt or reference image')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedVideo(null)

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          referenceImage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const data = await response.json()
      setGeneratedVideo(data.videoUrl)
      onVideoGenerated(data.videoUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Generate Fashion Videos
        </h2>
        <p className="text-gray-600 mb-6">
          Create animated videos showcasing your designs. Upload a reference image
          and describe the motion or presentation you want.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Image
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
          >
            {referenceImage ? (
              <div className="relative w-full h-64">
                <Image
                  src={referenceImage}
                  alt="Reference"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload an image to animate
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motion Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Dress flowing elegantly in the wind, model walking on runway, fabric moving gracefully"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Prompts:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Runway walk with gentle fabric movement',
                '360 degree rotation',
                'Flowing in the wind',
                'Close-up of fabric details',
              ].map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  onClick={() => setPrompt(quickPrompt)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Generating Video (this may take a few minutes)...' : 'Generate Video'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">
            Generating your video... This usually takes 1-3 minutes.
          </p>
        </div>
      )}

      {generatedVideo && !loading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Generated Video
          </h3>
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <video
              src={generatedVideo}
              controls
              className="w-full"
              autoPlay
              loop
            />
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href={generatedVideo}
              download
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
            >
              Download Video
            </a>
            <button
              onClick={() => setGeneratedVideo(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
