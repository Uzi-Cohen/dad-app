'use client'

import { useState } from 'react'
import { AppLayout } from './components/AppLayout'

type VideoTemplate = 'elegant' | 'dynamic' | 'minimal' | 'luxury'

const translations = {
  en: {
    title: 'Transform Photos into Professional Fashion Videos',
    subtitle: 'Upload dress photos from multiple angles and watch AI create 10-second 4K cinematic videos with real models and professional backgrounds',
    uploadTitle: '1. Upload Images',
    uploadDrag: 'Drag and drop your dress photos here',
    uploadOr: 'or',
    uploadButton: 'Choose Files',
    uploadMultiple: 'Upload multiple angles for best results',
    changeImages: 'Add More Images',
    selectedAngle: 'Selected Angle',
    styleTitle: '2. Choose Style',
    elegantShowcase: 'Elegant Showcase',
    dynamicEnergy: 'Dynamic Energy',
    minimalChic: 'Minimal Chic',
    luxuryPremium: 'Luxury Premium',
    customPrompt: 'Custom Prompt (Optional)',
    customPromptPlaceholder: 'Describe your desired video style...',
    generateButton: 'Generate Video',
    progress: 'Progress',
    remaining: 'remaining',
    almostDone: 'Almost done...',
    initializing: 'Initializing...',
    generatingFrames: 'Generating frames...',
    addingMotion: 'Adding motion...',
    finalizing: 'Finalizing video...',
    complete: 'Complete!',
    resultTitle: '3. Your Video',
    noVideo: 'Your generated video will appear here',
    downloadVideo: 'Download Video',
    saveToGallery: 'Save to Gallery'
  },
  ar: {
    title: 'حول الصور إلى فيديوهات أزياء احترافية',
    subtitle: 'ارفع صور الفستان من زوايا متعددة وشاهد الذكاء الاصطناعي ينشئ فيديوهات سينمائية 4K مدتها 10 ثوانٍ مع عارضات حقيقيات وخلفيات احترافية',
    uploadTitle: '١. رفع الصور',
    uploadDrag: 'اسحب وأفلت صور الفستان هنا',
    uploadOr: 'أو',
    uploadButton: 'اختر الملفات',
    uploadMultiple: 'ارفع زوايا متعددة للحصول على أفضل النتائج',
    changeImages: 'إضافة المزيد من الصور',
    selectedAngle: 'الزاوية المحددة',
    styleTitle: '٢. اختر الأسلوب',
    elegantShowcase: 'عرض أنيق',
    dynamicEnergy: 'طاقة ديناميكية',
    minimalChic: 'أنيق بسيط',
    luxuryPremium: 'فاخر مميز',
    customPrompt: 'وصف مخصص (اختياري)',
    customPromptPlaceholder: 'صف أسلوب الفيديو المطلوب...',
    generateButton: 'إنشاء الفيديو',
    progress: 'التقدم',
    remaining: 'متبقي',
    almostDone: 'انتهى تقريبًا...',
    initializing: 'جاري التهيئة...',
    generatingFrames: 'جاري إنشاء الإطارات...',
    addingMotion: 'جاري إضافة الحركة...',
    finalizing: 'جاري إنهاء الفيديو...',
    complete: 'مكتمل!',
    resultTitle: '٣. الفيديو الخاص بك',
    noVideo: 'سيظهر الفيديو المُنشأ هنا',
    downloadVideo: 'تحميل الفيديو',
    saveToGallery: 'حفظ في المعرض'
  }
}

interface UploadedImage {
  id: string
  data: string
  name: string
}

export default function VideoStudioPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate>('elegant')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  const t = translations[language]

  const templates = [
    {
      id: 'elegant' as VideoTemplate,
      nameKey: 'elegantShowcase' as keyof typeof translations.en,
      prompt: 'Professional fashion model wearing the EXACT dress from the image - preserve all original colors, patterns, and design details. Walking elegantly on a luxury runway with professional studio lighting, smooth cinematic camera movements, photorealistic 4K quality, high-end fashion show atmosphere. DO NOT alter the dress design.',
      icon: '✨',
      color: 'from-purple-500 to-violet-600',
    },
    {
      id: 'dynamic' as VideoTemplate,
      nameKey: 'dynamicEnergy' as keyof typeof translations.en,
      prompt: 'Real fashion model wearing the EXACT dress from the image - maintain all original design details, colors, and patterns. Urban city setting, walking confidently through modern architecture, dynamic camera movement, vibrant natural lighting, photorealistic 4K quality. Preserve the dress exactly as shown.',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'minimal' as VideoTemplate,
      nameKey: 'minimalChic' as keyof typeof translations.en,
      prompt: 'Fashion model wearing the EXACT dress from the image - keep all original design elements, colors, and fabric textures unchanged. Minimalist white studio with natural window lighting, slow graceful movements, photorealistic quality. DO NOT modify the dress design.',
      icon: '🤍',
      color: 'from-gray-400 to-slate-600',
    },
    {
      id: 'luxury' as VideoTemplate,
      nameKey: 'luxuryPremium' as keyof typeof translations.en,
      prompt: 'High-fashion model wearing the EXACT dress from the image - preserve all original design details, patterns, and colors perfectly. Opulent luxury boutique setting, dramatic professional lighting with golden hour ambiance, cinematic camera work, photorealistic 4K quality. Keep dress design identical to original.',
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

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Math.random().toString(36).substring(7),
            data: e.target?.result as string,
            name: file.name
          }
          setUploadedImages(prev => [...prev, newImage])
          if (!selectedImageId) {
            setSelectedImageId(newImage.id)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
    if (selectedImageId === id) {
      setSelectedImageId(uploadedImages[0]?.id || null)
    }
  }

  const handleGenerateVideo = async () => {
    const selectedImage = uploadedImages.find(img => img.id === selectedImageId)
    if (!selectedImage) return

    setIsGenerating(true)
    setVideoUrl(null)
    setProgress(0)
    setEstimatedTime(120) // Estimate 120 seconds for 10s high-quality video

    try {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
      const finalPrompt = prompt || selectedTemplateData?.prompt || ''

      const response = await fetch('/api/runway/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage.data,
          prompt: finalPrompt,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
        setIsGenerating(false)
        return
      }

      // Start polling for completion
      if (data.taskId) {
        pollJobStatus(data.taskId)
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

  const pollJobStatus = async (taskId: string) => {
    const startTime = Date.now()

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/runway/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        })

        const task = await response.json()

        console.log('Task update:', task.status, task.progress)

        // Update progress (Runway returns progress as 0-1, convert to 0-100 for display)
        const currentProgress = (task.progress || 0) * 100
        setProgress(currentProgress)

        // Calculate estimated time remaining
        const elapsed = (Date.now() - startTime) / 1000 // seconds
        if (currentProgress > 0 && currentProgress < 100) {
          const totalEstimated = (elapsed / currentProgress) * 100
          const remaining = Math.max(0, totalEstimated - elapsed)
          setEstimatedTime(Math.ceil(remaining))
        }

        // Check task status (Runway statuses: PENDING, RUNNING, SUCCEEDED, FAILED, CANCELLED)
        if (task.status === 'SUCCEEDED') {
          setProgress(100)
          setEstimatedTime(0)

          if (task.output && task.output.length > 0) {
            const videoUrl = task.output[0]
            setVideoUrl(videoUrl)
            setIsGenerating(false)

            // Save to gallery
            saveVideoToGallery(videoUrl, taskId)
          }
        } else if (task.status === 'FAILED') {
          alert('Video generation failed: ' + (task.failure || 'Unknown error'))
          setIsGenerating(false)
          setProgress(0)
        } else {
          // Still processing (PENDING or RUNNING), check again in 5 seconds
          setTimeout(checkStatus, 5000)
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
      <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Language Switcher */}
        <div className="flex justify-end">
          <div className="glass rounded-xl p-1 border border-white/10 flex gap-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                language === 'ar'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="glass rounded-2xl p-8 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-gray-400 text-lg">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📸</span>
              {t.uploadTitle}
            </h3>

            {uploadedImages.length === 0 ? (
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
                  {t.uploadDrag}
                </p>
                <p className="text-gray-500 text-sm mb-2">{t.uploadOr}</p>
                <label className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">
                  {t.uploadButton}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-500 text-xs mt-4">{t.uploadMultiple}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Image Preview */}
                {selectedImageId && (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 border-2 border-purple-500">
                    <img
                      src={uploadedImages.find(img => img.id === selectedImageId)?.data}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {t.selectedAngle}
                    </div>
                  </div>
                )}

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImageId === img.id
                          ? 'ring-2 ring-purple-500 opacity-100'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.data}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(img.id)
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <label className="w-full block text-center py-2 text-sm text-gray-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-all cursor-pointer">
                  {t.changeImages}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              {t.styleTitle}
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
                    {t[template.nameKey]}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.customPrompt}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.customPromptPlaceholder}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/5 text-white placeholder-gray-500"
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={uploadedImages.length === 0 || isGenerating}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 ${
                uploadedImages.length === 0 || isGenerating
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  {t.generateButton}...
                </span>
              ) : (
                `🎬 ${t.generateButton}`
              )}
            </button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mt-6 space-y-3 animate-fadeIn">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    {t.progress}: {Math.round(progress)}%
                  </span>
                  <span className="text-gray-400">
                    {estimatedTime > 0 ? `~${estimatedTime}s ${t.remaining}` : t.almostDone}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradient transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
                <div className="text-xs text-center text-gray-400">
                  {progress < 20 && `🎬 ${t.initializing}`}
                  {progress >= 20 && progress < 50 && `✨ ${t.generatingFrames}`}
                  {progress >= 50 && progress < 80 && `🎨 ${t.addingMotion}`}
                  {progress >= 80 && progress < 100 && `🎞️ ${t.finalizing}`}
                  {progress >= 100 && `✅ ${t.complete}`}
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
              {t.resultTitle}
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
              ⬇️ {t.downloadVideo}
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
