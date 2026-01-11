'use client'

import { useState } from 'react'
import ImageGenerator from './components/ImageGenerator'
import VideoGenerator from './components/VideoGenerator'
import Gallery from './components/Gallery'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'gallery'>('image')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([])

  const addImage = (imageUrl: string) => {
    setGeneratedImages(prev => [imageUrl, ...prev])
  }

  const addVideo = (videoUrl: string) => {
    setGeneratedVideos(prev => [videoUrl, ...prev])
  }

  return (
    <div>
      <div className="mb-8">
        <nav className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            📸 Generate Images
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            🎬 Generate Videos
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            🖼️ Gallery ({generatedImages.length + generatedVideos.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {activeTab === 'image' && <ImageGenerator onImageGenerated={addImage} />}
        {activeTab === 'video' && <VideoGenerator onVideoGenerated={addVideo} />}
        {activeTab === 'gallery' && (
          <Gallery images={generatedImages} videos={generatedVideos} />
        )}
      </div>
    </div>
  )
}
