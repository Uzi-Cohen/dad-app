'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalBrands: 0,
  })
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [productsRes, brandsRes] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getBrands(),
      ])

      setStats({
        totalProducts: productsRes.products.length,
        activeJobs: 0, // We'll update this when we add job list
        completedJobs: 0,
        totalBrands: brandsRes.brands.length,
      })

      setRecentProducts(productsRes.products.slice(0, 6))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-2">Welcome Back! 👋</h2>
            <p className="text-purple-100 text-lg">
              Ready to create stunning promotional videos for your fashion products?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon="👗"
              label="Total Products"
              value={stats.totalProducts}
              color="purple"
              href="/products"
            />
            <StatsCard
              icon="⚙️"
              label="Active Jobs"
              value={stats.activeJobs}
              color="blue"
              href="/jobs"
            />
            <StatsCard
              icon="✅"
              label="Completed"
              value={stats.completedJobs}
              color="green"
              href="/jobs"
            />
            <StatsCard
              icon="🏢"
              label="Brands"
              value={stats.totalBrands}
              color="pink"
              href="/settings"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/products/new"
                className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">➕</span>
                <div>
                  <p className="font-semibold text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-600">Upload new dress photos</p>
                </div>
              </Link>

              <Link
                href="/products"
                className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🎬</span>
                <div>
                  <p className="font-semibold text-gray-900">Generate Video</p>
                  <p className="text-sm text-gray-600">Create promo videos</p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-4 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🎨</span>
                <div>
                  <p className="font-semibold text-gray-900">Brand Settings</p>
                  <p className="text-sm text-gray-600">Customize your brand</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Products */}
          {recentProducts.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Products</h3>
                <Link
                  href="/products"
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {product.assets[0] ? (
                        <img
                          src={product.assets[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-5xl">👗</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && recentProducts.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">🎬</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Products Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first product to generate videos
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
        </div>
      </DashboardLayout>
  )
}

function StatsCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: string
  label: string
  value: number
  color: string
  href: string
}) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all transform hover:scale-105"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${colors[color as keyof typeof colors]} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}
