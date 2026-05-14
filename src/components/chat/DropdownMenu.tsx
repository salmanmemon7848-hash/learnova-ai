'use client';

import { useEffect, useRef, useState } from 'react';
import { Share2, Pencil, Trash2 } from 'lucide-react';

interface DropdownMenuProps {
  onClose: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function DropdownMenu({ onClose, onShare, onRename, onDelete }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Check if dropdown goes off-screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        setPosition('top');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 ${position === 'bottom' ? 'top-8' : 'bottom-8'} z-50 w-44 bg-[#2a2a3d] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onShare(); onClose(); }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors text-left"
      >
        <Share2 size={16} />
        <span>Share</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRename(); onClose(); }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors text-left"
      >
        <Pencil size={16} />
        <span>Rename</span>
      </button>
      <div className="h-[1px] bg-white/5 my-1" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors text-left"
      >
        <Trash2 size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
}
