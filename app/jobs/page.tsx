'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/app/components/ProtectedRoute'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all')

  useEffect(() => {
    loadJobs()

    // Poll for updates every 5 seconds
    const interval = setInterval(loadJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadJobs = async () => {
    try {
      // Get all products with their generations
      const { products } = await apiClient.getProducts()

      const allJobs: any[] = []
      products.forEach((product: any) => {
        if (product._count?.generations > 0) {
          // We need to load each product to get generation details
          // For now, we'll just show a placeholder
        }
      })

      // TODO: Create a dedicated jobs endpoint
      // For now, we'll show a simple interface
      setJobs(allJobs)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true
    if (filter === 'running') return job.status === 'QUEUED' || job.status === 'RUNNING'
    if (filter === 'completed') return job.status === 'COMPLETED'
    if (filter === 'failed') return job.status === 'FAILED'
    return true
  })

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Generation Jobs</h2>
            <p className="text-gray-600 mt-1">Track video generation progress</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 inline-flex gap-2">
            <FilterButton
              label="All"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={jobs.length}
            />
            <FilterButton
              label="Running"
              active={filter === 'running'}
              onClick={() => setFilter('running')}
              count={jobs.filter((j) => j.status === 'QUEUED' || j.status === 'RUNNING').length}
            />
            <FilterButton
              label="Completed"
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
              count={jobs.filter((j) => j.status === 'COMPLETED').length}
            />
            <FilterButton
              label="Failed"
              active={filter === 'failed'}
              onClick={() => setFilter('failed')}
              count={jobs.filter((j) => j.status === 'FAILED').length}
            />
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/products/${job.productId}`}
                          className="font-semibold text-purple-600 hover:text-purple-700"
                        >
                          {job.product?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {job.template || 'Custom'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{job.provider}</span>
                      </td>
                      <td className="px-6 py-4">
                        <JobStatus status={job.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {job.status === 'COMPLETED' && job.outputAsset && (
                          <a
                            href={job.outputAsset.url}
                            download
                            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                          >
                            Download
                          </a>
                        )}
                        {(job.status === 'QUEUED' || job.status === 'RUNNING') && (
                          <button className="text-red-600 hover:text-red-700 font-semibold text-sm">
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">⚙️</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'No Jobs Yet' : `No ${filter} jobs`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'Generate your first video to see it here'
                  : `No jobs with status: ${filter}`}
              </p>
              {filter === 'all' && (
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <span>🎬</span>
                  <span>Generate Video</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function FilterButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
        active
          ? 'bg-purple-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label} {count > 0 && `(${count})`}
    </button>
  )
}

function JobStatus({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: string }> = {
    QUEUED: { bg: 'bg-gray-500', text: 'text-white', icon: '⏳' },
    RUNNING: { bg: 'bg-blue-500', text: 'text-white', icon: '⚙️' },
    COMPLETED: { bg: 'bg-green-500', text: 'text-white', icon: '✅' },
    FAILED: { bg: 'bg-red-500', text: 'text-white', icon: '❌' },
    CANCELLED: { bg: 'bg-gray-400', text: 'text-white', icon: '⏹️' },
  }

  const config = configs[status] || configs.QUEUED

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  )
}
