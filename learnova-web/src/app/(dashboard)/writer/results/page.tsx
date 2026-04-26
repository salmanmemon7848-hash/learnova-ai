'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WriterResultsPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('writerResult');
    const savedMeta = sessionStorage.getItem('writerMeta');
    if (!saved) { router.push('/writer'); return; }
    setContent(JSON.parse(saved));
    if (savedMeta) setMeta(JSON.parse(savedMeta));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta?.topic || 'content'}-learnova.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!content) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0F10]">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/writer')}
          className="text-purple-400 hover:text-purple-300 text-sm mb-4 flex items-center gap-2"
        >
          ← Back to AI Writer
        </button>
        <h1 className="text-3xl font-bold text-white">Your Generated Content</h1>
        {meta && (
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
              {meta.contentType}
            </span>
            <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
              {meta.tone} tone
            </span>
            <span className="text-gray-500 text-xs">Topic: {meta.topic}</span>
          </div>
        )}
      </div>

      {/* Content Box */}
      <div className="bg-[#1A1A1E] border border-gray-700/50 rounded-2xl p-8 mb-6 relative">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-200 text-base leading-8 whitespace-pre-wrap">{content}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={handleCopy}
          className="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy Content'}
        </button>
        <button
          onClick={handleDownload}
          className="bg-[#1A1A1E] hover:bg-gray-800 text-gray-300 border border-gray-700/50 py-3 rounded-xl font-semibold transition-colors"
        >
          📥 Download .txt
        </button>
        <button
          onClick={() => router.push('/writer')}
          className="bg-[#1A1A1E] hover:bg-gray-800 text-gray-300 border border-gray-700/50 py-3 rounded-xl font-semibold transition-colors"
        >
          ✍️ Generate New
        </button>
      </div>

    </div>
  );
}
