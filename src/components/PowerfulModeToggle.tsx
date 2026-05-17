'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export function PowerfulModeBadge() {
  return <div style={styles.answerBadge}>POWERFUL MODE ANSWER</div>;
}

export function PowerfulModeToggle({
  isPowerfulMode,
  onToggle,
  disabled,
  currentStatus = 'idle',
}: {
  isPowerfulMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
  currentStatus?: string;
}) {
  const STATUS_DISPLAY: Record<string, { label: string; icon: string }> = {
    idle:               { label: 'Powerful Mode',         icon: '⚡' },
    searching_web:      { label: 'Searching the web...',  icon: '🔍' },
    groq_working:       { label: 'Groq Llama is thinking...', icon: '🧠' },
    gemini_working:     { label: 'Gemini is thinking...', icon: '✨' },
    openai_working:     { label: 'OpenAI is working...',  icon: '🤖' },
    openrouter_working: { label: 'Deep reasoning...',     icon: '🔮' },
    generating:         { label: 'Crafting your answer...', icon: '📝' },
  };

  const status = STATUS_DISPLAY[currentStatus] || STATUS_DISPLAY.idle;

  return (
    <div style={styles.toggleContainer}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        title={isPowerfulMode ? 'Powerful Mode is on' : 'Enable Powerful Mode'}
        style={{
          ...styles.toggleBtn,
          ...(isPowerfulMode ? styles.toggleBtnOn : styles.toggleBtnOff),
          ...(disabled ? styles.toggleBtnDisabled : {}),
        }}
      >
        {isPowerfulMode ? (
          <>
            <span style={styles.toggleDot} />
            POWERFUL MODE ON
          </>
        ) : (
          <>Powerful Mode</>
        )}
      </button>

      {isPowerfulMode && currentStatus !== 'idle' && (
        <div style={styles.statusWrapper} className="toggle-status-text">
          <span style={styles.statusIcon}>{status.icon}</span>
          <span style={styles.statusText}>{status.label}</span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  toggleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    minHeight: 54, // Reserve space for status text
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    border: '1.5px solid',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    fontFamily: 'inherit',
    minHeight: 34,
  },
  toggleBtnOn: {
    background: 'linear-gradient(135deg, #171720 0%, #18233a 52%, #0f3157 100%)',
    borderColor: '#f7c948',
    color: '#f7c948',
    boxShadow: '0 0 12px rgba(247,201,72,0.35), 0 0 24px rgba(247,201,72,0.15)',
    animation: 'powerfulGlow 2s ease-in-out infinite',
  },
  toggleBtnOff: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.12)',
    color: 'rgba(240,240,255,0.72)',
  },
  toggleBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  toggleDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#f7c948',
    boxShadow: '0 0 6px #f7c948',
    display: 'inline-block',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  statusWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    opacity: 0.8,
    animation: 'fadeInSlide 0.3s ease-out forwards',
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#f7c948',
    fontStyle: 'italic',
  },
  answerBadge: {
    color: '#f7c948',
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 6,
  },
};
