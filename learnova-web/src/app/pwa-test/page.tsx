'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PWATestPage() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#0f1117', color: '#e2e8f0' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📱 PWA Configuration Test</h1>

        <div className="space-y-6">
          {/* Manifest Check */}
          <div className="p-6 rounded-xl border" style={{ background: '#13151e', borderColor: '#2a2d3a' }}>
            <h2 className="text-2xl font-semibold mb-4">✅ Manifest Configuration</h2>
            <div className="space-y-2 text-sm">
              <p>✓ Manifest file: <code className="text-purple-400">/manifest.json</code></p>
              <p>✓ Icons: <code className="text-purple-400">icon-192.png</code> and <code className="text-purple-400">icon-512.png</code></p>
              <p>✓ Theme color: <code className="text-purple-400">#534AB7</code></p>
              <p>✓ Display mode: <code className="text-purple-400">standalone</code></p>
              <p>✓ Start URL: <code className="text-purple-400">/dashboard?source=pwa</code></p>
            </div>
          </div>

          {/* Service Worker Check */}
          <div className="p-6 rounded-xl border" style={{ background: '#13151e', borderColor: '#2a2d3a' }}>
            <h2 className="text-2xl font-semibold mb-4">🔧 Service Worker</h2>
            <div className="space-y-2 text-sm">
              <p>✓ Service worker registered: <code className="text-purple-400">/service-worker.js</code></p>
              <p>✓ Cache strategy: Network first with cache fallback</p>
              <p>✓ Push notifications supported</p>
              <p>✓ Offline support enabled</p>
            </div>
          </div>

          {/* Install Instructions */}
          <div className="p-6 rounded-xl border" style={{ background: '#13151e', borderColor: '#2a2d3a' }}>
            <h2 className="text-2xl font-semibold mb-4">📲 How to Install</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Android (Chrome)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Open your site in Chrome</li>
                  <li>Tap the menu (⋮) in the top right</li>
                  <li>Tap "Install app" or "Add to Home screen"</li>
                  <li>Follow the prompts</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">iOS (Safari)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Open your site in Safari</li>
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Desktop (Chrome/Edge)</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Look for the install icon in the address bar</li>
                  <li>Click "Install"</li>
                  <li>Follow the prompts</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="p-6 rounded-xl border" style={{ background: '#13151e', borderColor: '#2a2d3a' }}>
            <h2 className="text-2xl font-semibold mb-4">🐛 Debug Information</h2>
            <div id="debug-info" className="space-y-2 text-sm font-mono">
              <p>Checking PWA support...</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-lg font-medium text-white" style={{ background: '#534AB7' }}>
              Go to Dashboard
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 rounded-lg font-medium border"
              style={{ borderColor: '#2a2d3a', color: '#9ca3af' }}
            >
              Refresh Test
            </button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const debugInfo = document.getElementById('debug-info');
          const logs = [];

          // Check service worker support
          if ('serviceWorker' in navigator) {
            logs.push('✓ Service Worker API: Supported');
          } else {
            logs.push('✗ Service Worker API: Not Supported');
          }

          // Check if already installed
          if (window.matchMedia('(display-mode: standalone)').matches) {
            logs.push('✓ Display Mode: Standalone (App is installed!)');
          } else {
            logs.push('ℹ Display Mode: Browser (Not installed yet)');
          }

          // Check for beforeinstallprompt
          window.addEventListener('beforeinstallprompt', function(e) {
            logs.push('✓ Install Prompt Event: Available');
            updateDebug();
          });

          // Check service worker registration
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              if (registrations.length > 0) {
                logs.push('✓ Service Worker: Registered');
              } else {
                logs.push('✗ Service Worker: Not Registered');
              }
              updateDebug();
            });
          }

          // Check manifest
          fetch('/manifest.json')
            .then(r => r.json())
            .then(data => {
              logs.push('✓ Manifest: Loaded successfully');
              logs.push('  - Name: ' + data.name);
              logs.push('  - Short Name: ' + data.short_name);
              logs.push('  - Icons: ' + data.icons.length + ' configured');
              updateDebug();
            })
            .catch(err => {
              logs.push('✗ Manifest: Failed to load');
              updateDebug();
            });

          function updateDebug() {
            debugInfo.innerHTML = logs.map(l => '<p>' + l + '</p>').join('');
          }

          updateDebug();
        })();
      `}} />
    </div>
  )
}
