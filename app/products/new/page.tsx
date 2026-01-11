'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [brandId, setBrandId] = useState('')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [fabric, setFabric] = useState('')
  const [colors, setColors] = useState('')
  const [sizes, setSizes] = useState('')
  const [status, setStatus] = useState('DRAFT')

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const { brands } = await apiClient.getBrands()
      setBrands(brands)

      if (brands.length > 0) {
        setBrandId(brands[0].id)
      }
    } catch (error) {
      console.error('Failed to load brands:', error)
      setError('Failed to load brands. Please create a brand first in Settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validation
      if (!brandId) {
        throw new Error('Please select a brand')
      }
      if (!sku.trim()) {
        throw new Error('SKU is required')
      }
      if (!name.trim()) {
        throw new Error('Product name is required')
      }

      // Create product
      const { product } = await apiClient.createProduct({
        brandId,
        sku: sku.trim(),
        name: name.trim(),
        price: price ? parseFloat(price) : undefined,
        fabric: fabric.trim() || undefined,
        colors: colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        status,
      })

      // Redirect to product detail page
      router.push(`/products/${product.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setSaving(false)
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

  if (brands.length === 0) {
    return (
      
        <DashboardLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">🏢</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Brand Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You need to create a brand before adding products
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>🎨</span>
                <span>Create Brand</span>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      
    )
  }

  return (
    
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/products"
              className="text-purple-600 hover:text-purple-700 font-semibold mb-2 inline-block"
            >
              ← Back to Products
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Add New Product</h2>
            <p className="text-gray-600 mt-1">
              Create a new dress in your catalog
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Brand</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Brand *
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU / Product Code *
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                      placeholder="DR-001"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for this product
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="299.99"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Elegant Evening Gown"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="Silk, Satin, Chiffon, etc."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Variants</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Colors
                  </label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="Black, Navy Blue, Burgundy"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple colors with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Sizes
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="XS, S, M, L, XL"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple sizes with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="DRAFT">Draft (Not visible)</option>
                    <option value="ACTIVE">Active (Available for sale)</option>
                    <option value="SOLD">Sold Out</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
              >
                {saving ? 'Creating...' : '✨ Create Product'}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              After creating, you'll be able to upload photos and generate videos
            </p>
          </form>
        </div>
      </DashboardLayout>
    
  )
}
