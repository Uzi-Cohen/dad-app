'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/app/components/DashboardLayout'
import { apiClient } from '@/lib/api-client'

export default function SettingsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [watermarkPosition, setWatermarkPosition] = useState('BOTTOM_RIGHT')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.7)
  const [defaultPrompt, setDefaultPrompt] = useState(
    'High-end fashion product video of a dress, realistic fabric texture preserved, subtle cinematic camera push-in, soft studio lighting, clean background, elegant boutique look, sharp stitching, natural folds, no distortion.'
  )
  const [negativePrompt, setNegativePrompt] = useState(
    'no extra limbs, no distorted fabric, no warped patterns, no blurry details, no watermarks, no text'
  )

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const { brands } = await apiClient.getBrands()
      setBrands(brands)

      if (brands.length > 0) {
        selectBrand(brands[0])
      }
    } catch (error) {
      console.error('Failed to load brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectBrand = (brand: any) => {
    setSelectedBrand(brand)
    setName(brand.name)
    setWatermarkPosition(brand.watermarkPosition)
    setWatermarkOpacity(brand.watermarkOpacity)
    setDefaultPrompt(brand.defaultPrompt)
    setNegativePrompt(brand.negativePrompt)
  }

  const handleSave = async () => {
    if (!selectedBrand) return

    setSaving(true)
    setMessage(null)

    try {
      await apiClient.updateBrand(selectedBrand.id, {
        name,
        watermarkPosition,
        watermarkOpacity,
        defaultPrompt,
        negativePrompt,
      })

      setMessage({ type: 'success', text: 'Brand settings saved successfully!' })
      loadBrands()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBrand = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { brand } = await apiClient.createBrand({
        name: 'New Brand',
        watermarkPosition: 'BOTTOM_RIGHT',
        watermarkOpacity: 0.7,
      })

      setMessage({ type: 'success', text: 'Brand created successfully!' })
      await loadBrands()
      selectBrand(brand)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create brand' })
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

  return (
    
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Brand Settings</h2>
              <p className="text-gray-600 mt-1">
                Customize your brand kit, watermarks, and video styles
              </p>
            </div>

            {brands.length > 0 && (
              <button
                onClick={handleCreateBrand}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all"
              >
                <span>➕</span>
                <span>New Brand</span>
              </button>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`px-4 py-3 rounded-lg border-2 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Brand Selector */}
          {brands.length > 1 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Brand
              </label>
              <div className="flex gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => selectBrand(brand)}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                      selectedBrand?.id === brand.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedBrand ? (
            <>
              {/* Brand Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Brand Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="My Fashion House"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Logo (Coming Soon)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <span className="text-4xl block mb-2">🖼️</span>
                      <p className="text-gray-600">Logo upload feature coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Watermark Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Watermark Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={watermarkPosition}
                      onChange={(e) => setWatermarkPosition(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="TOP_LEFT">Top Left</option>
                      <option value="TOP_RIGHT">Top Right</option>
                      <option value="BOTTOM_LEFT">Bottom Left</option>
                      <option value="BOTTOM_RIGHT">Bottom Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Opacity: {Math.round(watermarkOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Prompt Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Video Generation Prompts</h3>
                <p className="text-sm text-gray-600 mb-4">
                  These prompts are used for all video generations. Customize them to match your brand style.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Prompt (What you want)
                    </label>
                    <textarea
                      value={defaultPrompt}
                      onChange={(e) => setDefaultPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      placeholder="Describe the style and quality you want in your videos..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This describes the desired output style, quality, and characteristics
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Negative Prompt (What to avoid)
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      placeholder="List things to avoid in the video..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This helps the AI avoid unwanted artifacts, distortions, or elements
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  {saving ? 'Saving...' : '💾 Save Settings'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <span className="text-6xl block mb-4">🏢</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Brand Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first brand to customize video generation settings
              </p>
              <button
                onClick={handleCreateBrand}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>➕</span>
                <span>Create Your Brand</span>
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    
  )
}
