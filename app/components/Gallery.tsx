'use client'

import Image from 'next/image'

interface GalleryProps {
  images: string[]
  videos: string[]
}

export default function Gallery({ images, videos }: GalleryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
        <p className="text-gray-600 mb-6">
          View all your generated images and videos
        </p>
      </div>

      {images.length === 0 && videos.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate some images or videos to see them here
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
              >
                <Image
                  src={imageUrl}
                  alt={`Generated ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a
                    href={imageUrl}
                    download
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Videos ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((videoUrl, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg overflow-hidden"
              >
                <video
                  src={videoUrl}
                  controls
                  className="w-full"
                />
                <div className="p-4">
                  <a
                    href={videoUrl}
                    download
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold py-2 px-4 rounded-lg"
                  >
                    Download Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
