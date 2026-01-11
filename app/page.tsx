'use client'

import { useState } from 'react'
import { AppLayout } from './components/AppLayout'

type VideoTemplate = 'elegant' | 'dynamic' | 'minimal' | 'luxury'

export default function VideoStudioPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate>('elegant')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const templates = [
    {
      id: 'elegant' as VideoTemplate,
      name: 'Elegant Showcase',
      prompt: 'Elegant runway style presentation with smooth camera movements, professional fashion lighting, luxurious atmosphere',
      icon: '✨',
      color: 'purple',
    },
    {
      id: 'dynamic' as VideoTemplate,
      name: 'Dynamic Energy',
      prompt: 'Dynamic energetic fashion video with quick cuts, vibrant movement, modern urban vibe, trending style',
      icon: '⚡',
      color: 'blue',
    },
    {
      id: 'minimal' as VideoTemplate,
      name: 'Minimal Chic',
      prompt: 'Minimalist clean presentation, soft lighting, gentle movements, sophisticated and timeless aesthetic',
      icon: '🤍',
      color: 'gray',
    },
    {
      id: 'luxury' as VideoTemplate,
      name: 'Luxury Premium',
      prompt: 'High-end luxury fashion presentation, dramatic lighting, cinematic quality, exclusive boutique feel',
      icon: '💎',
      color: 'pink',
    },
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateVideo = async () => {
    if (!uploadedImage) return

    setIsGenerating(true)
    setVideoUrl(null)

    try {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
      const finalPrompt = prompt || selectedTemplateData?.prompt || ''

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          prompt: finalPrompt,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      // Poll for video completion
      if (data.jobId) {
        pollJobStatus(data.jobId)
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate video')
      setIsGenerating(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()

        if (data.job?.status === 'COMPLETED' && data.job?.outputUrl) {
          setVideoUrl(data.job.outputUrl)
          setIsGenerating(false)
        } else if (data.job?.status === 'FAILED') {
          alert('Video generation failed')
          setIsGenerating(false)
        } else {
          // Still processing, check again in 3 seconds
          setTimeout(checkStatus, 3000)
        }
      } catch (error) {
        console.error('Status check failed:', error)
        setIsGenerating(false)
      }
    }

    checkStatus()
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Transform Photos into Cinematic Videos</h2>
          <p className="text-purple-100 text-lg">
            Upload a dress photo and watch AI create a stunning promotional video
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Upload Image</h3>

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <span className="text-6xl block mb-4">📸</span>
                <p className="text-gray-900 font-semibold mb-2">
                  Drag and drop your dress photo here
                </p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <label className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Choose Style</h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setPrompt('')
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {template.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video style you want..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={!uploadedImage || isGenerating}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                !uploadedImage || isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Generating Video...
                </span>
              ) : (
                '🎬 Generate Video'
              )}
            </button>
          </div>
        </div>

        {/* Video Result */}
        {videoUrl && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Video is Ready! 🎉</h3>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
            />
            <a
              href={videoUrl}
              download
              className="mt-4 inline-block w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
