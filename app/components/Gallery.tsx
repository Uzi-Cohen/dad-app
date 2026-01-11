'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryProps {
  images: string[]
  videos: string[]
}

export default function Gallery({ images, videos }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  if (images.length === 0 && videos.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Gallery is Empty</h3>
        <p className="text-gray-600 mb-6">
          Start creating amazing fashion designs and they'll appear here!
        </p>
        <p className="text-sm text-gray-500">
          Generated images and videos will be saved in this gallery for easy access
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🖼️ Your Creative Gallery
        </h2>
        <p className="text-gray-700">
          {images.length} image{images.length !== 1 ? 's' : ''} and {videos.length} video{videos.length !== 1 ? 's' : ''} created
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📸</span> Generated Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-purple-400 transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
                onClick={() => setSelectedImage(imageUrl)}
              >
                <Image
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-lg">
                    👁️ View
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎬</span> Generated Videos ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((videoUrl, index) => (
              <div
                key={index}
                className="relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-blue-400 transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
                onClick={() => setSelectedVideo(videoUrl)}
              >
                <video
                  src={videoUrl}
                  className="w-full"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center pointer-events-none">
                  <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-lg">
                    ▶️ Play
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
            >
              ✕
            </button>
            <div className="relative w-full h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={selectedImage}
                alt="Selected"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={selectedImage}
                download
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
            >
              ✕
            </button>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <video
                src={selectedVideo}
                controls
                autoPlay
                loop
                className="max-h-[80vh] w-auto"
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={selectedVideo}
                download
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
