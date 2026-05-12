'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PowerfulModeSources as PowerfulModeSourcesType } from '@/hooks/usePowerfulMode';

const PROGRESS_STAGES = [
  { pct: 8, label: 'Activating tri-intelligence engine...' },
  { pct: 20, label: 'GPT-4o analyzing your question...' },
  { pct: 35, label: 'Gemini expanding knowledge scope...' },
  { pct: 52, label: 'Groq LLaMA injecting speed intelligence...' },
  { pct: 68, label: 'Cross-referencing 3 AI outputs...' },
  { pct: 80, label: "Synthesizing the strongest answer..." },
  { pct: 92, label: 'Finalizing elite-grade response...' },
  { pct: 99, label: 'Almost ready...' },
];

export function PowerfulModeProgress({ isLoading }: { isLoading: boolean }) {
  const [stage, setStage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isLoading) return;

    let current = 0;
    const resetTimer = setTimeout(() => setStage(0), 0);
    intervalRef.current = setInterval(() => {
      current += 1;
      if (current < PROGRESS_STAGES.length) {
        setStage(current);
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 950);

    return () => {
      clearTimeout(resetTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const currentStage = PROGRESS_STAGES[stage];

  return (
    <div style={styles.progressWrapper}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>{currentStage.label}</span>
        <span style={styles.progressPct}>{currentStage.pct}%</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${currentStage.pct}%` }} />
        <div style={{ ...styles.progressShimmer, left: `${Math.max(0, currentStage.pct - 8)}%` }} />
      </div>
      <div style={styles.progressSubtext}>3 AI engines working in parallel</div>
    </div>
  );
}

export function PowerfulModeSources({ sources }: { sources: PowerfulModeSourcesType | null }) {
  const [open, setOpen] = useState(false);
  if (!sources) return null;

  const aiList: Array<{ name: string; key: keyof PowerfulModeSourcesType; color: string }> = [
    { name: 'GPT-4o', key: 'openai', color: '#10a37f' },
    { name: 'Gemini', key: 'gemini', color: '#4285f4' },
    { name: 'Groq LLaMA', key: 'groq', color: '#f97316' },
  ];

  return (
    <div style={styles.sourcesWrapper}>
      <button type="button" style={styles.sourcesToggle} onClick={() => setOpen((previous) => !previous)}>
        {open ? 'Hide' : 'Show'} individual AI responses
      </button>
      {open && (
        <div style={styles.sourcesGrid}>
          {aiList.map((ai) => (
            <div key={ai.key} style={{ ...styles.sourceCard, borderColor: ai.color }}>
              <div style={{ ...styles.sourceCardHeader, color: ai.color }}>{ai.name}</div>
              <div style={styles.sourceCardBody}>{sources[ai.key]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PowerfulModeBadge() {
  return <div style={styles.answerBadge}>POWERFUL MODE ANSWER | 3 AIs synthesized</div>;
}

export function PowerfulModeToggle({
  isPowerfulMode,
  onToggle,
  disabled,
}: {
  isPowerfulMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
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
          <span style={styles.toggleBadge}>x3</span>
        </>
      ) : (
        <>Powerful Mode</>
      )}
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
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
  toggleIconOff: {
    opacity: 0.62,
  },
  toggleBadge: {
    background: '#f7c948',
    color: '#171720',
    fontSize: 10,
    fontWeight: 800,
    padding: '1px 5px',
    borderRadius: 4,
  },
  progressWrapper: {
    marginBottom: 10,
    padding: '12px 14px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, rgba(23,23,32,0.98) 0%, rgba(15,49,87,0.92) 100%)',
    border: '1px solid rgba(247,201,72,0.25)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: 650,
    color: '#f7c948',
  },
  progressPct: {
    fontSize: 12,
    fontWeight: 800,
    color: 'rgba(247,201,72,0.84)',
  },
  progressTrack: {
    position: 'relative',
    height: 6,
    background: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #f7c948, #ff8a3d, #f7c948)',
    backgroundSize: '200% 100%',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'gradientShift 1.5s linear infinite',
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
    transition: 'left 0.8s ease',
    pointerEvents: 'none',
  },
  progressSubtext: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  sourcesWrapper: {
    marginTop: 8,
  },
  sourcesToggle: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(180,180,220,0.65)',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 0',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
  sourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  sourceCard: {
    borderRadius: 8,
    border: '1.5px solid',
    padding: 12,
    background: 'rgba(255,255,255,0.035)',
  },
  sourceCardHeader: {
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 6,
  },
  sourceCardBody: {
    fontSize: 12,
    color: 'rgba(230,230,245,0.76)',
    lineHeight: 1.6,
    maxHeight: 180,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
  },
  answerBadge: {
    color: '#f7c948',
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 6,
  },
};
