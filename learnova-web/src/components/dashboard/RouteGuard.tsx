'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { UserRole } from '@/contexts/RoleContext'

// Routes only students can access
const STUDENT_ONLY = ['/doubt-solver', '/exam', '/planner', '/edufinder', '/writer', '/career', '/notes', '/progress']
// Routes only founders can access
const FOUNDER_ONLY = ['/validate', '/pitch-deck', '/business-ideas']

function isStudentOnly(path: string) {
  return STUDENT_ONLY.some(r => path === r || path.startsWith(r + '/'))
}
function isFounderOnly(path: string) {
  return FOUNDER_ONLY.some(r => path === r || path.startsWith(r + '/'))
}

interface RouteGuardProps {
  role: UserRole
  children: React.ReactNode
}

export default function RouteGuard({ role, children }: RouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [toast, setToast] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (!role) return // still loading or unauthenticated — don't guard yet

    const isBlocked =
      (role === 'founder' && isStudentOnly(pathname)) ||
      (role === 'student' && isFounderOnly(pathname))

    if (isBlocked) {
      setToast(true)
      setBlocked(true)
      router.replace('/dashboard')
      const t = setTimeout(() => setToast(false), 3500)
      return () => clearTimeout(t)
    } else {
      setBlocked(false)
    }
  }, [pathname, role, router])

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#1e1b4b',
            border: '1px solid #4338ca',
            borderRadius: 12,
            padding: '12px 24px',
            color: '#a78bfa',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            animation: 'slideDown 0.3s ease',
          }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          🚫 This feature is not available for your account.
        </div>
      )}

      {/* Render children unless blocked */}
      {!blocked && children}
    </>
  )
}
