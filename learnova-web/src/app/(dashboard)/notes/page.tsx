'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Plus, Search, Trash2, Edit2, Calendar } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  tags: string[]
  sourceType: string
}

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // Create or update note
  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return

    try {
      const method = editingNote ? 'PUT' : 'POST'
      const response = await fetch('/api/notes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNote?.id,
          title: noteTitle,
          content: noteContent,
          sourceType: 'manual',
        }),
      })

      if (response.ok) {
        await fetchNotes()
        setShowModal(false)
        setNoteTitle('')
        setNoteContent('')
        setEditingNote(null)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  // Edit note
  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setShowModal(true)
  }

  // Delete note
  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNotes()
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // Open new note modal
  const handleNewNote = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setShowModal(true)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--foreground-secondary)' }}>Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            My Notes 📚
          </h1>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            All your saved study notes in one place
          </p>
        </div>
        <button onClick={handleNewNote} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-secondary)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by title, content, or tags..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-secondary)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No notes found
          </h3>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            {searchQuery ? 'Try a different search term' : 'Start saving notes from chat or doubt solver'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-xl border transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--foreground)' }}>
                  {note.title}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(note)} className="p-1.5 rounded hover:bg-gray-500/10 transition-colors">
                    <Edit2 className="w-4 h-4" style={{ color: 'var(--foreground-secondary)' }} />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--foreground-secondary)' }}>
                {note.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--foreground-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs mx-1" style={{ color: 'var(--foreground-secondary)' }}>•</span>
                <span className="text-xs capitalize" style={{ color: 'var(--foreground-secondary)' }}>
                  from {note.sourceType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating/editing notes */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13151e] border border-[#2a2d3a] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
                  style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' }}
                  onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
                  Content
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note content..."
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all resize-none"
                  style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' }}
                  onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={!noteTitle.trim() || !noteContent.trim()}
                  className="flex-1 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingNote(null)
                    setNoteTitle('')
                    setNoteContent('')
                  }}
                  className="px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium"
                  style={{ backgroundColor: '#2a2d3a', color: '#e2e8f0' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
