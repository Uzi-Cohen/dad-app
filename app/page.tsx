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
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'image'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Generate Images
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Generate Videos
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Gallery ({generatedImages.length + generatedVideos.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'image' && <ImageGenerator onImageGenerated={addImage} />}
        {activeTab === 'video' && <VideoGenerator onVideoGenerated={addVideo} />}
        {activeTab === 'gallery' && (
          <Gallery images={generatedImages} videos={generatedVideos} />
        )}
      </div>
    </div>
  )
}
