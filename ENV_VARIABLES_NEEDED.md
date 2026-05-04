# Environment Variables Required

Configure these in `learnova-web/.env.local` (local) or your host’s environment settings (e.g. Vercel). Never commit real secrets.

## Server-side only (never use `NEXT_PUBLIC_` prefix)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) — primary LLM on the server |
| `GOOGLE_AI_API_KEY` | From [Google AI Studio](https://aistudio.google.com) — Gemini fallback (`GOOGLE_AI_STUDIO_API_KEY` still supported as alias) |
| `SEARXNG_URL` | Your SearXNG instance base/search URL (e.g. `https://learnova-searxng.onrender.com/search`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API — server-only; used for admin operations (e.g. auth security logging) |
| `ANTHROPIC_API_KEY` | For `/api/learnova` (Claude) — optional if that route is unused |
| `STRIPE_SECRET_KEY` | Stripe dashboard — payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth (NextAuth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (NextAuth) |

## Client + server (`NEXT_PUBLIC_` prefix)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |

## Optional

| Variable | Example | Description |
|----------|---------|-------------|
| `GOOGLE_AI_MODEL` | `gemini-2.0-flash` | Gemini model name (if your code reads it) |

## Whisper (Mock Interview)

Mock Interview voice uses a **server-side** proxy at `/api/transcribe`. `GROQ_API_KEY` stays on the server.
