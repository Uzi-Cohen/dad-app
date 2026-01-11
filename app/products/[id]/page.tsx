'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const { product } = await apiClient.getProduct(params.id)
      setProduct(product)
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
          </div>
        </DashboardLayout>
      
    )
  }

  if (!product) {
    return (
      
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
            <Link href="/products" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
              ← Back to Products
            </Link>
          </div>
        </DashboardLayout>
      
    )
  }

  const imageAssets = product.assets?.filter((a: any) => a.type === 'IMAGE') || []
  const videoGenerations = product.generations || []
  const completedVideos = videoGenerations.filter((g: any) => g.status === 'COMPLETED')

  return (
    
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <Link
                href="/products"
                className="text-purple-600 hover:text-purple-700 font-semibold mb-2 inline-block"
              >
                ← Back to Products
              </Link>
              <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/products/${product.id}/edit`)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                ✏️ Edit
              </button>
              {imageAssets.length > 0 && (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <span>🎬</span>
                  <span>Generate Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.price && (
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-gray-900">${product.price}</p>
                </div>
              )}
              {product.fabric && (
                <div>
                  <p className="text-sm text-gray-600">Fabric</p>
                  <p className="font-semibold text-gray-900">{product.fabric}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    product.status === 'ACTIVE'
                      ? 'bg-green-500 text-white'
                      : product.status === 'DRAFT'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="font-semibold text-gray-900">{product.brand?.name || 'N/A'}</p>
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Product Photos ({imageAssets.length})</h3>
              <button
                onClick={() => router.push(`/products/${product.id}/upload`)}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                + Add Photos
              </button>
            </div>

            {imageAssets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageAssets.map((asset: any) => (
                  <div
                    key={asset.id}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer group relative"
                  >
                    <img
                      src={asset.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {asset.role === 'HERO' && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        HERO
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-5xl block mb-2">📸</span>
                <p className="text-gray-600">No photos uploaded yet</p>
                <button
                  onClick={() => router.push(`/products/${product.id}/upload`)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Upload Photos →
                </button>
              </div>
            )}
          </div>

          {/* Generated Videos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Generated Videos ({completedVideos.length})
            </h3>

            {completedVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedVideos.map((generation: any) => (
                  <div
                    key={generation.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-all"
                  >
                    {generation.outputAsset && (
                      <video
                        src={generation.outputAsset.url}
                        controls
                        className="w-full rounded-lg mb-3"
                      />
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {new Date(generation.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-purple-600 font-semibold">{generation.aspectRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-5xl block mb-2">🎬</span>
                <p className="text-gray-600">No videos generated yet</p>
                {imageAssets.length > 0 && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <span>🎬</span>
                    <span>Generate First Video</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          {videoGenerations.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Generation History</h3>
              <div className="space-y-3">
                {videoGenerations.slice(0, 5).map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{job.template || 'Custom'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        job.status === 'COMPLETED'
                          ? 'bg-green-500 text-white'
                          : job.status === 'FAILED'
                          ? 'bg-red-500 text-white'
                          : job.status === 'RUNNING'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Generation Modal */}
        {showVideoModal && (
          <VideoGenerationModal
            product={product}
            imageAssets={imageAssets}
            onClose={() => setShowVideoModal(false)}
            onGenerated={() => {
              setShowVideoModal(false)
              loadProduct()
            }}
          />
        )}
      </DashboardLayout>
    
  )
}

function VideoGenerationModal({
  product,
  imageAssets,
  onClose,
  onGenerated,
}: {
  product: any
  imageAssets: any[]
  onClose: () => void
  onGenerated: () => void
}) {
  const [selectedImages, setSelectedImages] = useState<string[]>([imageAssets[0]?.id].filter(Boolean))
  const [template, setTemplate] = useState('runway-cinematic')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [duration, setDuration] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const templates = [
    { id: 'runway-cinematic', name: '🎥 Cinematic Push', desc: 'Slow dramatic push-in' },
    { id: 'mannequin-spin', name: '↻ Mannequin Spin', desc: '360° rotation' },
    { id: 'fabric-macro', name: '🔍 Fabric Closeup', desc: 'Texture details' },
    { id: 'runway-spotlight', name: '✨ Runway Spotlight', desc: 'Stage presentation' },
  ]

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      setError('Please select at least one image')
      return
    }

    setError('')
    setLoading(true)

    try {
      await apiClient.generateVideo({
        productId: product.id,
        inputAssetIds: selectedImages,
        template,
        aspectRatio,
        duration,
      })

      onGenerated()
    } catch (err: any) {
      setError(err.message || 'Failed to generate video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Generate Video</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Select Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Images (1-6)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {imageAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedImages((prev) =>
                      prev.includes(asset.id)
                        ? prev.filter((id) => id !== asset.id)
                        : [...prev, asset.id].slice(0, 6)
                    )
                  }}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${
                    selectedImages.includes(asset.id)
                      ? 'border-purple-600 scale-95'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Video Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    template === t.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="9:16">9:16 (Reels/TikTok)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Instagram Portrait)</option>
                <option value="16:9">16:9 (Landscape)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={6}>6 seconds (recommended)</option>
                <option value={8}>8 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || selectedImages.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
            >
              {loading ? 'Generating...' : '🎬 Generate Video'}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Video will be generated in the background. Check the Jobs page for progress.
          </p>
        </div>
      </div>
    </div>
  )
}
