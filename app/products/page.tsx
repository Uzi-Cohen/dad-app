'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { products } = await apiClient.getProducts()
      setProducts(products)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-600 mt-1">
                Manage your dress catalog and generate videos
              </p>
            </div>

            <Link
              href="/products/new"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <span>➕</span>
              <span>Add Product</span>
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">👗</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Products Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first product to start generating promotional videos
              </p>
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>➕</span>
                <span>Add Your First Product</span>
              </Link>
            </div>
          )}

          {/* No Search Results */}
          {!loading && products.length > 0 && filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    
  )
}

function ProductCard({ product }: { product: any }) {
  const heroImage = product.assets?.find((a: any) => a.role === 'HERO') || product.assets?.[0]
  const generationCount = product._count?.generations || 0

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage.url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">👗</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
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
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{product._count?.assets || 0} photos</span>
          <span>{generationCount} videos</span>
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex gap-1">
            {product.colors.slice(0, 4).map((color: string, idx: number) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs"
                title={color}
              >
                🎨
              </div>
            ))}
            {product.colors.length > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs bg-gray-100">
                +{product.colors.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
