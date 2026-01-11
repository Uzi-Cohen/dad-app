'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export default function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
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
    if (!prompt) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/generate-image', {
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
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      onImageGenerated(data.imageUrl)
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
          Generate Fashion Images
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a reference photo of a dress and describe the variations you want to create.
          The AI will maintain consistent details while applying your modifications.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Image (Optional)
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
                  Click to upload a reference image
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
            Describe Your Design
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A flowing evening gown with intricate lace details, elegant off-shoulder design, in deep burgundy color"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Prompts:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Change color to navy blue',
                'Add floral embroidery',
                'Make it midi length',
                'Add long sleeves',
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
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="loader"></div>
        </div>
      )}

      {generatedImage && !loading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Generated Image
          </h3>
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={generatedImage}
              alt="Generated"
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href={generatedImage}
              download
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
            >
              Download Image
            </a>
            <button
              onClick={() => setGeneratedImage(null)}
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
