'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MessageActionsProps {
  messageText: string;
}

export function MessageActions({ messageText }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
        title="Copy message"
      >
        {copied ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}
