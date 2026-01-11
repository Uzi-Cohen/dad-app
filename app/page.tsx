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
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)

  const templates = [
    {
      id: 'elegant' as VideoTemplate,
      name: 'Elegant Showcase',
      prompt: 'Elegant runway style presentation with smooth camera movements, professional fashion lighting, luxurious atmosphere',
      icon: '✨',
      color: 'from-purple-500 to-violet-600',
    },
    {
      id: 'dynamic' as VideoTemplate,
      name: 'Dynamic Energy',
      prompt: 'Dynamic energetic fashion video with quick cuts, vibrant movement, modern urban vibe, trending style',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'minimal' as VideoTemplate,
      name: 'Minimal Chic',
      prompt: 'Minimalist clean presentation, soft lighting, gentle movements, sophisticated and timeless aesthetic',
      icon: '🤍',
      color: 'from-gray-400 to-slate-600',
    },
    {
      id: 'luxury' as VideoTemplate,
      name: 'Luxury Premium',
      prompt: 'High-end luxury fashion presentation, dramatic lighting, cinematic quality, exclusive boutique feel',
      icon: '💎',
      color: 'from-pink-500 to-rose-600',
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
    setProgress(0)
    setEstimatedTime(60) // Estimate 60 seconds

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
        setIsGenerating(false)
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

  const saveVideoToGallery = (videoUrl: string, jobId: string) => {
    const saved = localStorage.getItem('generated-videos')
    const videos = saved ? JSON.parse(saved) : []

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

    const newVideo = {
      id: jobId,
      videoUrl,
      thumbnailUrl: uploadedImage || '',
      createdAt: new Date().toISOString(),
      template: selectedTemplateData?.name || 'Custom',
      prompt: prompt || selectedTemplateData?.prompt || '',
    }

    videos.unshift(newVideo) // Add to beginning
    localStorage.setItem('generated-videos', JSON.stringify(videos))
  }

  const pollJobStatus = async (jobId: string) => {
    const startTime = Date.now()

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()

        // Update progress
        const currentProgress = data.job?.progress || 0
        setProgress(currentProgress)

        // Calculate estimated time remaining
        const elapsed = (Date.now() - startTime) / 1000 // seconds
        if (currentProgress > 0) {
          const totalEstimated = (elapsed / currentProgress) * 100
          const remaining = Math.max(0, totalEstimated - elapsed)
          setEstimatedTime(Math.ceil(remaining))
        }

        if (data.job?.status === 'COMPLETED' && data.job?.outputUrl) {
          setVideoUrl(data.job.outputUrl)
          setIsGenerating(false)
          setProgress(100)
          setEstimatedTime(0)

          // Save to gallery
          saveVideoToGallery(data.job.outputUrl, jobId)
        } else if (data.job?.status === 'FAILED') {
          alert('Video generation failed: ' + (data.job?.error || 'Unknown error'))
          setIsGenerating(false)
          setProgress(0)
        } else {
          // Still processing, check again in 2 seconds
          setTimeout(checkStatus, 2000)
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
        <div className="glass rounded-2xl p-8 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Transform Photos into Cinematic Videos
          </h2>
          <p className="text-gray-400 text-lg">
            Upload a dress photo and watch AI create a stunning promotional video with Runway Gen-4
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📸</span>
              1. Upload Image
            </h3>

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-purple-500/50 hover:bg-white/5'
                }`}
              >
                <span className="text-6xl block mb-4 animate-float">📸</span>
                <p className="text-white font-semibold mb-2">
                  Drag and drop your dress photo here
                </p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <label className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">
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
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-all"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              2. Choose Style
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setPrompt('')
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedTemplate === template.id
                      ? `border-purple-500 bg-gradient-to-br ${template.color} shadow-lg shadow-purple-500/50`
                      : 'border-gray-700 hover:border-purple-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className={`font-semibold text-sm ${selectedTemplate === template.id ? 'text-white' : 'text-gray-300'}`}>
                    {template.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video style you want..."
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/5 text-white placeholder-gray-500"
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={!uploadedImage || isGenerating}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 ${
                !uploadedImage || isGenerating
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105'
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

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mt-6 space-y-3 animate-fadeIn">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    Progress: {Math.round(progress)}%
                  </span>
                  <span className="text-gray-400">
                    {estimatedTime > 0 ? `~${estimatedTime}s remaining` : 'Almost done...'}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradient transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
                <div className="text-xs text-center text-gray-400">
                  {progress < 20 && '🎬 Initializing...'}
                  {progress >= 20 && progress < 50 && '✨ Generating frames...'}
                  {progress >= 50 && progress < 80 && '🎨 Adding motion...'}
                  {progress >= 80 && progress < 100 && '🎞️ Finalizing video...'}
                  {progress >= 100 && '✅ Complete!'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Result */}
        {videoUrl && (
          <div className="glass rounded-2xl p-6 border border-green-500/20 shadow-2xl shadow-green-500/10 animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">🎉</span>
              Your Video is Ready!
            </h3>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-xl border border-white/10 shadow-2xl"
            />
            <a
              href={videoUrl}
              download
              className="mt-4 inline-block w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70"
            >
              ⬇️ Download Video
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
