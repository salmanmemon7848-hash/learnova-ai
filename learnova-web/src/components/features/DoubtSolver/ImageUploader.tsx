'use client'

import { useState } from 'react'
import { Upload, Camera, X, Sparkles } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (base64Image: string) => void
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setPreview(base64)
        onImageSelect(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // In a real implementation, you'd capture a frame from the stream
      // For now, we'll just trigger the file input
      const input = document.getElementById('file-upload') as HTMLInputElement
      input?.click()
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.error('Camera access denied:', err)
      // Fallback to file input
      const input = document.getElementById('file-upload') as HTMLInputElement
      input?.click()
    }
  }

  const removeImage = () => {
    setPreview(null)
    onImageSelect('')
  }

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-[var(--accent-purple)] bg-[var(--accent-purple-glow)]'
              : 'border-[var(--border-input)] hover:border-[var(--accent-purple)] hover:bg-[var(--bg-tertiary)]'
          }`}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-purple-glow)] flex items-center justify-center">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#534AB7' }} />
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }} mb-1>
                Upload Your Question
              </p>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Tap to upload or take a photo
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  document.getElementById('file-upload')?.click()
                }}
                className="px-3 sm:px-4 py-2 bg-[#534AB7] text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse Files
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCamera()
                }}
                className="px-3 sm:px-4 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border-input)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                style={{ color: 'var(--accent-purple-light)' }}
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                Camera
              </button>
            </div>

            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }} mt-2>
              Supports: JPG, PNG, JPEG • Max size: 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border-2 border-[rgba(83,74,183,0.3)]">
          <img
            src={preview}
            alt="Uploaded question"
            className="w-full h-auto max-h-96 object-contain" style={{ backgroundColor: 'var(--bg-tertiary)' }}
          />
          <button
            onClick={removeImage}
            className="absolute top-3 right-3 w-8 h-8 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center hover:bg-red-900/20 transition-colors shadow-md"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
          <div className="absolute bottom-3 left-3 bg-[#534AB7] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Image ready for AI solving
          </div>
        </div>
      )}
    </div>
  )
}
