export const MAX_INPUT_CHARS: Record<string, number> = {
  chat: 500,
  'doubt-solver': 500,
  'career-guide': 300,
  edufinder: 300,
  exam: 500,
  planner: 1000,
  interview: 1000,
  writer: 1000,
  'business-ideas': 800,
  validate: 800,
  'pitch-deck': 1000,
};

export function validateInput(input: string, feature: string): string | null {
  const max = MAX_INPUT_CHARS[feature] || 500;
  if (!input || input.trim().length === 0) return 'Please enter something before submitting.';
  if (input.length > max) return `Input too long. Maximum ${max} characters allowed.`;
  return null;
}

export function buildRateLimitMessage(data: any): string {
  return data?.message || `You have reached your limit. Resets in ${data?.timeUntilReset || 'soon'}.`;
}
