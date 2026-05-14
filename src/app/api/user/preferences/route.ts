import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sanitizeJsonPostBody, sanitizeString } from '@/lib/validation'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    let rawBody: unknown = {}
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['userType', 'toneMode', 'language'], 8000)
    if (!parsed.ok) return parsed.response

    const b = parsed.body

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const userType = sanitizeString(b.userType, 64)
    const toneMode = sanitizeString(b.toneMode, 64)
    const language = sanitizeString(b.language, 32)

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: { userType?: string; toneMode?: string; language?: string } = {}
    if ('userType' in b) data.userType = userType
    if ('toneMode' in b) data.toneMode = toneMode
    if ('language' in b) data.language = language

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No preference fields provided' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    })

    // Create usage tracking
    await prisma.usage.create({
      data: {
        userId: session.user.id,
      },
    })

    // Create subscription (free plan by default)
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: 'free',
      },
    })

    // Create preferences
    await prisma.userPreferences.create({
      data: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save preferences:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
