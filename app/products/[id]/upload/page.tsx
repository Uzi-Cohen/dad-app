'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface UploadFile {
  id: string
  file: File
  preview: string
  role: 'HERO' | 'DETAIL'
  uploading: boolean
  uploaded: boolean
  error?: string
}

export default function UploadPhotosPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadFile[] = Array.from(selectedFiles)
      .filter(file => file.type.startsWith('image/'))
      .map((file, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        role: index === 0 && files.length === 0 ? 'HERO' : 'DETAIL',
        uploading: false,
        uploaded: false,
      }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id)
      // If we removed the hero, make the first one hero
      if (newFiles.length > 0 && !newFiles.some(f => f.role === 'HERO')) {
        newFiles[0].role = 'HERO'
      }
      return newFiles
    })
  }

  const setAsHero = (id: string) => {
    setFiles(prev =>
      prev.map(f => ({
        ...f,
        role: f.id === id ? 'HERO' : 'DETAIL',
      }))
    )
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Convert to base64
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string

            await apiClient.uploadAsset(params.id, {
              type: 'IMAGE',
              role: uploadFile.role,
              base64Data,
              filename: uploadFile.file.name,
            })

            resolve()
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(uploadFile.file)
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleUploadAll = async () => {
    setUploading(true)

    for (const file of files) {
      if (file.uploaded) continue

      // Mark as uploading
      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, uploading: true, error: undefined } : f
        )
      )

      try {
        await uploadFile(file)

        // Mark as uploaded
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, uploading: false, uploaded: true } : f
          )
        )
      } catch (error: any) {
        // Mark as error
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, uploading: false, error: error.message || 'Upload failed' }
              : f
          )
        )
      }
    }

    setUploading(false)

    // Check if all uploaded successfully
    const allUploaded = files.every(f => f.uploaded)
    if (allUploaded) {
      // Redirect back to product page
      setTimeout(() => {
        router.push(`/products/${params.id}`)
      }, 1000)
    }
  }

  const allUploaded = files.length > 0 && files.every(f => f.uploaded)
  const hasFiles = files.length > 0
  const canUpload = hasFiles && !uploading && !allUploaded

  return (
    
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/products/${params.id}`}
              className="text-purple-600 hover:text-purple-700 font-semibold mb-2 inline-block"
            >
              ← Back to Product
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Upload Photos</h2>
            <p className="text-gray-600 mt-1">
              Add photos of your dress to generate videos
            </p>
          </div>

          {/* Success Message */}
          {allUploaded && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              ✅ All photos uploaded successfully! Redirecting...
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-xl p-12 shadow-sm border-2 border-dashed transition-all cursor-pointer mb-6 ${
              dragging
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="text-center">
              <span className="text-6xl block mb-4">📸</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Drop photos here or click to browse
              </h3>
              <p className="text-gray-600 mb-4">
                Upload 1-6 high-quality photos of your dress
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, WEBP • Max size: 10MB per file
              </p>
            </div>
          </div>

          {/* File List */}
          {hasFiles && (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Selected Photos ({files.length})
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative group border-2 border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                        {!file.uploaded && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAsHero(file.id)
                              }}
                              className={`opacity-0 group-hover:opacity-100 px-3 py-1 rounded text-xs font-bold transition-all ${
                                file.role === 'HERO'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {file.role === 'HERO' ? 'HERO' : 'Set Hero'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFile(file.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-all"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>

                      {/* Status Badge */}
                      {file.role === 'HERO' && !file.uploaded && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                          HERO
                        </div>
                      )}

                      {file.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-xs">Uploading...</p>
                          </div>
                        </div>
                      )}

                      {file.uploaded && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
                          <div className="text-white text-center">
                            <span className="text-3xl block mb-1">✓</span>
                            <p className="text-xs font-bold">Uploaded</p>
                          </div>
                        </div>
                      )}

                      {file.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
                          <div className="text-white text-center p-2">
                            <span className="text-3xl block mb-1">✗</span>
                            <p className="text-xs font-bold">{file.error}</p>
                          </div>
                        </div>
                      )}

                      {/* Filename */}
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate" title={file.file.name}>
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> The HERO image will be the main photo shown in the
                    product grid. Click "Set Hero" on any photo to change it.
                  </p>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/products/${params.id}`)}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadAll}
                  disabled={!canUpload}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
                >
                  {uploading
                    ? `Uploading... (${files.filter(f => f.uploaded).length}/${files.length})`
                    : allUploaded
                    ? '✓ All Uploaded'
                    : `📤 Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    
  )
}
