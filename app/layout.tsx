import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fashion Design Generator',
  description: 'AI-powered photo and video generation for fashion design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">✨</div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Fashion Design Studio
                  </h1>
                  <p className="text-purple-100 mt-1 text-lg">
                    🎨 AI-Powered Photo & Video Generation for Fashion Excellence
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="mt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
              <p className="text-sm">Made with ❤️ for fashion designers</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
