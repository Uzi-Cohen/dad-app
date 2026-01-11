'use client'

import { useState, useRef, DragEvent } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReferenceImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleGenerate = async () => {
    if (!referenceImage) {
      setError('Please upload an image to animate')
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
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate video')
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎬 Generate Fashion Videos
        </h2>
        <p className="text-gray-700">
          Bring your designs to life! Upload a dress photo and create stunning animated videos showing movement and flow.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            📸 Dress Image (Required)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50 scale-105'
                : referenceImage
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {referenceImage ? (
              <div className="relative w-full h-64">
                <Image
                  src={referenceImage}
                  alt="Reference"
                  fill
                  className="object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setReferenceImage(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="py-8">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
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
                <p className="mt-4 text-base font-medium text-gray-700">
                  {isDragging ? '📥 Drop image here!' : '🖱️ Click or drag & drop'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a dress photo to animate
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            🎭 Motion Description (Optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Dress flowing elegantly in the wind, model walking on runway, fabric moving gracefully"
            className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base transition-all"
          />

          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">⚡ Quick Ideas:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Runway walk with gentle movement',
                '360 degree rotation',
                'Flowing in the wind',
                'Close-up of fabric details',
                'Elegant twirl',
                'Smooth fabric sway',
              ].map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  onClick={() => setPrompt(quickPrompt)}
                  className="px-4 py-2 text-sm font-medium bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-full transition-all transform hover:scale-105"
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
        disabled={loading || !referenceImage}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg text-lg"
      >
        {loading ? '🎬 Creating Video Magic...' : '🎥 Generate Video'}
      </button>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="loader"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">
            Generating your video... This takes 1-3 minutes 🎬
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Perfect time for a quick coffee break! ☕
          </p>
        </div>
      )}

      {generatedVideo && !loading && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Your Generated Video
          </h3>
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
            <video
              src={generatedVideo}
              controls
              className="w-full"
              autoPlay
              loop
            />
          </div>
          <div className="mt-6 flex gap-4">
            <a
              href={generatedVideo}
              download
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl text-center transition-all transform hover:scale-105 shadow-lg"
            >
              ⬇️ Download Video
            </a>
            <button
              onClick={() => {
                setGeneratedVideo(null)
                setReferenceImage(null)
                setPrompt('')
              }}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
