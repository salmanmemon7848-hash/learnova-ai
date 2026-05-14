'use client'

import { useRef, useState, useEffect, KeyboardEvent } from 'react'
import { Paperclip, ArrowUp, X } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string, image?: File) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled = false, placeholder = 'Ask Thinkior anything...' }: ChatInputProps) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 144) + 'px'
  }, [text])

  function handleFile(file: File) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) return
    if (file.size > 10 * 1024 * 1024) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImage(null); setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSend() {
    if (disabled) return
    if (!text.trim() && !image) return
    onSend(text.trim(), image ?? undefined)
    setText(''); removeImage()
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const canSend = !disabled && (text.trim().length > 0 || image !== null)

  return (
    <div style={{ background: '#160D2E', border: '1px solid #2D1B69', borderRadius: 14, padding: '10px 12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px #7C3AED20' }}
      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2D1B69'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      {/* Image preview */}
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <img src={preview} alt="Attached" style={{ height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid #2D1B69' }} />
          <button onClick={removeImage} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#7C3AED', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
            <X size={10} />
          </button>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        rows={1}
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#F5F3FF', fontSize: 14, lineHeight: 1.6, minHeight: 24, maxHeight: 144, display: 'block' }}
      />

      {/* Bottom row: attach + send */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
        >
          <Paperclip size={18} />
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
            background: canSend ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#2D1B69',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: canSend ? '0 4px 12px #7C3AED40' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <ArrowUp size={16} color="white" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
    </div>
  )
}
