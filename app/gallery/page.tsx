'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../components/AppLayout'

interface SavedVideo {
  id: string
  videoUrl: string
  thumbnailUrl: string
  createdAt: string
  template: string
  prompt: string
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = () => {
    const saved = localStorage.getItem('generated-videos')
    if (saved) {
      const parsed = JSON.parse(saved)
      setVideos(parsed)
    }
  }

  const deleteVideo = (id: string) => {
    const updated = videos.filter(v => v.id !== id)
    setVideos(updated)
    localStorage.setItem('generated-videos', JSON.stringify(updated))
    if (selectedVideo?.id === id) {
      setSelectedVideo(null)
    }
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to delete all videos? This cannot be undone.')) {
      setVideos([])
      localStorage.removeItem('generated-videos')
      setSelectedVideo(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="glass rounded-2xl p-8 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Video Gallery
              </h2>
              <p className="text-gray-400 text-lg">
                All your generated videos in one place
              </p>
            </div>
            {videos.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-all"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="glass rounded-2xl p-16 border border-white/10 text-center">
            <div className="text-6xl mb-4 animate-float">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Videos Yet</h3>
            <p className="text-gray-400 mb-6">
              Generate your first video and it will appear here automatically
            </p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/50"
            >
              Create Video
            </a>
          </div>
        )}

        {/* Video Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="glass rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900">
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-4xl">▶️</span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString()} • {new Date(video.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                      {video.template}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {video.prompt || 'No prompt'}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={video.videoUrl}
                      download={`video-${video.id}.mp4`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-center py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-600/30 transition-all border border-green-500/50"
                    >
                      ⬇️ Download
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVideo(video.id)
                      }}
                      className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 transition-all border border-red-500/50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="glass rounded-2xl p-6 border border-white/10 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Video Details</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl border border-white/10 mb-4"
              />

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="text-white ml-2">
                    {new Date(selectedVideo.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Style:</span>
                  <span className="text-white ml-2">{selectedVideo.template}</span>
                </div>
                {selectedVideo.prompt && (
                  <div>
                    <span className="text-gray-500">Prompt:</span>
                    <p className="text-white mt-1 p-3 bg-white/5 rounded-lg">
                      {selectedVideo.prompt}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <a
                  href={selectedVideo.videoUrl}
                  download={`video-${selectedVideo.id}.mp4`}
                  className="flex-1 text-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50"
                >
                  ⬇️ Download Video
                </a>
                <button
                  onClick={() => deleteVideo(selectedVideo.id)}
                  className="px-6 py-3 bg-red-600/20 text-red-400 font-bold rounded-lg hover:bg-red-600/30 transition-all border border-red-500/50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
