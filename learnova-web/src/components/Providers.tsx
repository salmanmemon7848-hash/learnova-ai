'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { RoleProvider } from '@/contexts/RoleContext'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Clear stale caches automatically to prevent blank screen issues
  useEffect(() => {
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
