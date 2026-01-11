'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Video Studio', href: '/', icon: '🎬' },
    { name: 'Image Generator', href: '/generate-image', icon: '🖼️' },
    { name: 'Dress Designer', href: '/design', icon: '✏️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <span className="text-3xl">👗</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Fashion AI Studio
              </h1>
              <p className="text-sm text-gray-500">
                Design, generate, and transform with AI
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div>{children}</div>
      </div>
    </div>
  )
}
