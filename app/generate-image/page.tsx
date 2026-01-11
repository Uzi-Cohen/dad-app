'use client'

import { useState } from 'react'
import { AppLayout } from '../components/AppLayout'

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const styles = [
    { id: 'realistic', name: 'Realistic', icon: '📸', prompt: 'photorealistic, high quality, professional photography', gradient: 'from-blue-500 to-cyan-600' },
    { id: 'artistic', name: 'Artistic', icon: '🎨', prompt: 'artistic, creative, stylized illustration', gradient: 'from-purple-500 to-pink-600' },
    { id: 'fashion', name: 'Fashion Editorial', icon: '📰', prompt: 'high fashion editorial, vogue style, professional fashion photography', gradient: 'from-rose-500 to-orange-600' },
    { id: 'luxury', name: 'Luxury', icon: '💎', prompt: 'luxury premium fashion, elegant, sophisticated, high-end boutique', gradient: 'from-violet-500 to-purple-600' },
  ]

  const suggestions = [
    'Elegant red evening gown with flowing silk fabric',
    'Modern minimalist white dress with clean lines',
    'Vintage floral print summer dress with lace details',
    'Glamorous sequined cocktail dress in champagne gold',
    'Bohemian maxi dress with embroidered patterns',
    'Classic little black dress with subtle texture',
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const selectedStyle = styles.find(s => s.id === style)
      const fullPrompt = `${prompt}, ${selectedStyle?.prompt || ''}`

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="glass rounded-2xl p-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AI Fashion Image Generator
          </h2>
          <p className="text-gray-400 text-lg">
            Describe your dream dress and watch AI bring it to life
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                Describe Your Design
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dress Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Elegant flowing red evening gown with silk fabric and intricate beading..."
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 text-white placeholder-gray-500"
                  rows={5}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                        style === s.id
                          ? `border-blue-500 bg-gradient-to-br ${s.gradient} shadow-lg shadow-blue-500/50`
                          : 'border-gray-700 hover:border-blue-500/50 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className={`font-semibold text-sm ${style === s.id ? 'text-white' : 'text-gray-300'}`}>
                        {s.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Generating Image...
                  </span>
                ) : (
                  '🖼️ Generate Image'
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Need Inspiration?
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 bg-white/5 rounded-lg hover:bg-blue-500/20 hover:text-white hover:border hover:border-blue-500/50 transition-all"
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Generated Image
            </h3>

            {!generatedImage && !isGenerating && (
              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4 animate-float">🎨</span>
                  <p className="text-gray-400 font-medium">
                    Your generated image will appear here
                  </p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4 animate-pulse">✨</span>
                  <p className="text-blue-400 font-semibold">
                    Creating your design...
                  </p>
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="space-y-4 animate-fadeIn">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                  <img
                    src={generatedImage}
                    alt="Generated dress"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={generatedImage}
                    download="generated-dress.png"
                    className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50"
                  >
                    ⬇️ Download
                  </a>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="bg-gray-700 text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-600 hover:text-white transition-all"
                  >
                    🔄 Generate New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
