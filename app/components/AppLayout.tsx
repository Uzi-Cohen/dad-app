'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '../contexts/LanguageContext'

const navTranslations = {
  en: {
    videoStudio: 'Video Studio',
    gallery: 'Gallery',
    imageGenerator: 'Image Generator',
    dressDesigner: 'Dress Designer',
    title: 'Fashion AI Studio',
    subtitle: 'Design, generate, and transform with cutting-edge AI',
    footer: 'Powered by Runway AI • Made with ✨'
  },
  ar: {
    videoStudio: 'استوديو الفيديو',
    gallery: 'المعرض',
    imageGenerator: 'مولد الصور',
    dressDesigner: 'مصمم الفساتين',
    title: 'استوديو الأزياء بالذكاء الاصطناعي',
    subtitle: 'صمم، أنشئ، وحوّل باستخدام تقنية الذكاء الاصطناعي المتطورة',
    footer: 'مدعوم بـ Runway AI • صنع بـ ✨'
  }
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { language } = useLanguage()
  const t = navTranslations[language]

  const navigation = [
    { nameKey: 'videoStudio' as keyof typeof navTranslations.en, href: '/', icon: '🎬', gradient: 'from-purple-500 to-pink-500' },
    { nameKey: 'gallery' as keyof typeof navTranslations.en, href: '/gallery', icon: '🎞️', gradient: 'from-violet-500 to-purple-500' },
    { nameKey: 'imageGenerator' as keyof typeof navTranslations.en, href: '/generate-image', icon: '🖼️', gradient: 'from-blue-500 to-cyan-500' },
    { nameKey: 'dressDesigner' as keyof typeof navTranslations.en, href: '/design', icon: '✏️', gradient: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="text-4xl animate-pulse-glow">👗</div>
            <div>
              <h1 className="text-2xl font-bold neon-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 animate-fadeIn" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <nav className={`flex ${language === 'ar' ? 'space-x-reverse' : ''} space-x-2 glass rounded-2xl p-2`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  className={`
                    flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-purple-500/50 scale-105`
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{t[item.nameKey]}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="animate-fadeIn">{children}</div>
      </div>

      {/* Footer credit */}
      <div className="relative text-center py-8 text-gray-600 text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {t.footer}
      </div>
    </div>
  )
}
