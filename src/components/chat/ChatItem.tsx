'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu } from './DropdownMenu';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onShare: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatItem({
  session,
  isActive,
  onSelect,
  onShare,
  onRename,
  onDelete,
}: ChatItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative mb-1 px-2">
      <button
        onClick={() => onSelect(session.id)}
        className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-left transition-all duration-200 ${
          isActive
            ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300 shadow-lg shadow-violet-900/20'
            : 'bg-[var(--bg-surface)] border border-white/5 text-gray-300 hover:text-white hover:bg-[var(--bg-elevated)] hover:border-white/10'
        }`}
      >
        <span className="flex-1 overflow-hidden text-ellipsis white-space-nowrap">
          💬 {session.title || 'New conversation'}
        </span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-opacity duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center ${
          showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <MoreHorizontal size={16} />
      </button>

      {showMenu && (
        <DropdownMenu
          onClose={() => setShowMenu(false)}
          onShare={() => onShare(session.id)}
          onRename={() => onRename(session.id)}
          onDelete={() => onDelete(session.id)}
        />
      )}
    </div>
  );
}
