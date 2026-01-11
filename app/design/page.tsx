'use client'

import { useState } from 'react'
import { AppLayout } from '../components/AppLayout'

interface Measurements {
  bust: string
  waist: string
  hips: string
  length: string
  shoulders: string
}

export default function DressDesignerPage() {
  const [measurements, setMeasurements] = useState<Measurements>({
    bust: '',
    waist: '',
    hips: '',
    length: '',
    shoulders: '',
  })

  const [dressType, setDressType] = useState('evening-gown')
  const [fabric, setFabric] = useState('silk')
  const [color, setColor] = useState('#ff1493')
  const [neckline, setNeckline] = useState('v-neck')
  const [sleeves, setSleeves] = useState('sleeveless')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null)

  const dressTypes = [
    { id: 'evening-gown', name: 'Evening Gown', icon: '👗' },
    { id: 'cocktail', name: 'Cocktail Dress', icon: '🥂' },
    { id: 'maxi', name: 'Maxi Dress', icon: '🌺' },
    { id: 'mini', name: 'Mini Dress', icon: '✨' },
    { id: 'midi', name: 'Midi Dress', icon: '🌸' },
    { id: 'ball-gown', name: 'Ball Gown', icon: '👑' },
  ]

  const fabrics = [
    { id: 'silk', name: 'Silk' },
    { id: 'satin', name: 'Satin' },
    { id: 'chiffon', name: 'Chiffon' },
    { id: 'velvet', name: 'Velvet' },
    { id: 'lace', name: 'Lace' },
    { id: 'cotton', name: 'Cotton' },
    { id: 'tulle', name: 'Tulle' },
  ]

  const necklines = [
    { id: 'v-neck', name: 'V-Neck' },
    { id: 'round', name: 'Round' },
    { id: 'sweetheart', name: 'Sweetheart' },
    { id: 'off-shoulder', name: 'Off-Shoulder' },
    { id: 'halter', name: 'Halter' },
    { id: 'strapless', name: 'Strapless' },
  ]

  const sleeveOptions = [
    { id: 'sleeveless', name: 'Sleeveless' },
    { id: 'short', name: 'Short' },
    { id: 'long', name: 'Long' },
    { id: 'three-quarter', name: '3/4 Length' },
    { id: 'cap', name: 'Cap Sleeve' },
    { id: 'bell', name: 'Bell Sleeve' },
  ]

  const handleMeasurementChange = (field: keyof Measurements, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }))
  }

  const buildPrompt = () => {
    const dressTypeName = dressTypes.find(d => d.id === dressType)?.name || dressType
    const fabricName = fabrics.find(f => f.id === fabric)?.name || fabric
    const necklineName = necklines.find(n => n.id === neckline)?.name || neckline
    const sleeveName = sleeveOptions.find(s => s.id === sleeves)?.name || sleeves

    let prompt = `Professional fashion design: ${dressTypeName} in ${fabricName} fabric, ${necklineName} neckline, ${sleeveName} sleeves, color ${color}.`

    if (measurements.bust || measurements.waist || measurements.hips || measurements.length) {
      prompt += ' Custom tailored fit'
      if (measurements.bust) prompt += `, bust ${measurements.bust}cm`
      if (measurements.waist) prompt += `, waist ${measurements.waist}cm`
      if (measurements.hips) prompt += `, hips ${measurements.hips}cm`
      if (measurements.length) prompt += `, length ${measurements.length}cm`
    }

    if (additionalDetails.trim()) {
      prompt += `. Additional details: ${additionalDetails}`
    }

    prompt += '. High quality fashion photography, professional studio lighting, elegant presentation.'

    return prompt
  }

  const handleGenerateDesign = async () => {
    setIsGenerating(true)
    setGeneratedDesign(null)

    try {
      const prompt = buildPrompt()

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      if (data.imageUrl) {
        setGeneratedDesign(data.imageUrl)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate design')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Custom Dress Designer</h2>
          <p className="text-pink-100 text-lg">
            Design your perfect dress with precise measurements and AI visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Form */}
          <div className="space-y-6">
            {/* Measurements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📏 Measurements (cm)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bust</label>
                  <input
                    type="number"
                    value={measurements.bust}
                    onChange={(e) => handleMeasurementChange('bust', e.target.value)}
                    placeholder="85"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waist</label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                    placeholder="65"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hips</label>
                  <input
                    type="number"
                    value={measurements.hips}
                    onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                    placeholder="90"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                  <input
                    type="number"
                    value={measurements.length}
                    onChange={(e) => handleMeasurementChange('length', e.target.value)}
                    placeholder="120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shoulders</label>
                  <input
                    type="number"
                    value={measurements.shoulders}
                    onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                    placeholder="38"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Dress Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Dress Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {dressTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDressType(type.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      dressType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-semibold text-gray-900 text-xs">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric & Color */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fabric & Color</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                  <select
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    {fabrics.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Neckline & Sleeves */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Neckline & Sleeves</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Neckline</label>
                  <select
                    value={neckline}
                    onChange={(e) => setNeckline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    {necklines.map((n) => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleeves</label>
                  <select
                    value={sleeves}
                    onChange={(e) => setSleeves(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    {sleeveOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h3>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Add embellishments, patterns, special features..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDesign}
              disabled={isGenerating}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Generating Design...
                </span>
              ) : (
                '✨ Generate Custom Design'
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Design Preview</h3>

            {!generatedDesign && !isGenerating && (
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4">👗</span>
                  <p className="text-gray-600 font-medium">
                    Your custom design will appear here
                  </p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl block mb-4 animate-pulse">✨</span>
                  <p className="text-purple-700 font-semibold">
                    Designing your dress...
                  </p>
                </div>
              </div>
            )}

            {generatedDesign && (
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={generatedDesign}
                    alt="Custom dress design"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Measurements Summary */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Design Specifications:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    {measurements.bust && <p>• Bust: {measurements.bust}cm</p>}
                    {measurements.waist && <p>• Waist: {measurements.waist}cm</p>}
                    {measurements.hips && <p>• Hips: {measurements.hips}cm</p>}
                    {measurements.length && <p>• Length: {measurements.length}cm</p>}
                    {measurements.shoulders && <p>• Shoulders: {measurements.shoulders}cm</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={generatedDesign}
                    download="custom-dress-design.png"
                    className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setGeneratedDesign(null)}
                    className="bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    New Design
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
