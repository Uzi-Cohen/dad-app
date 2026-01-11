'use client'

import { useState } from 'react'
import { AppLayout } from '../components/AppLayout'

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const styles = [
    { id: 'realistic', name: 'Realistic', icon: '📸', prompt: 'photorealistic, high quality, professional photography' },
    { id: 'artistic', name: 'Artistic', icon: '🎨', prompt: 'artistic, creative, stylized illustration' },
    { id: 'fashion', name: 'Fashion Editorial', icon: '📰', prompt: 'high fashion editorial, vogue style, professional fashion photography' },
    { id: 'luxury', name: 'Luxury', icon: '💎', prompt: 'luxury premium fashion, elegant, sophisticated, high-end boutique' },
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">AI Fashion Image Generator</h2>
          <p className="text-blue-100 text-lg">
            Describe your dream dress and watch AI bring it to life
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Describe Your Design</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dress Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Elegant flowing red evening gown with silk fabric and intricate beading..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  rows={5}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        style === s.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Need Inspiration?</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-all"
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Generated Image</h3>

            {!generatedImage && !isGenerating && (
              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4">🎨</span>
                  <p className="text-gray-600 font-medium">
                    Your generated image will appear here
                  </p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4 animate-pulse">✨</span>
                  <p className="text-purple-700 font-semibold">
                    Creating your design...
                  </p>
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
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
                    className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Generate New
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
