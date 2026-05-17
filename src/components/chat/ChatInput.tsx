'use client'

import { useRef, useState, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void  // REMOVED: image param
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message Thinkior...',
}: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (disabled || !text.trim()) return
    onSend(text.trim())
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [disabled, text, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }

  const canSend = !disabled && text.trim().length > 0

  return (
    <div
      className="flex items-end gap-2 rounded-xl px-4 py-3"
      style={{
        background: '#160D2E',
        border: '1px solid #2D1B69',
      }}
    >
      {/* Text area — NO image button, NO paperclip, NO file input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-white text-sm leading-relaxed"
        style={{
          color: '#F5F3FF',
          minHeight: '24px',
          maxHeight: '200px',
        }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: canSend ? '#7C3AED' : '#2D1B69',
          width: '34px',
          height: '34px',
          cursor: canSend ? 'pointer' : 'not-allowed',
          opacity: canSend ? 1 : 0.5,
        }}
      >
        <ArrowUp size={16} color="white" />
      </button>
    </div>
  )
}
