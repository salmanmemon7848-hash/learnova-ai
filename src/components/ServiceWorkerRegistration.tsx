'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful')
          })
          .catch((err) => {
            console.error('ServiceWorker registration failed: ', err)
          })
      })
    }
  }, [])

  return null
}
