import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

    const parsed = sanitizeJsonPostBody(rawBody, ['name', 'email', 'password'], 20000)
    if (!parsed.ok) return parsed.response

    const b = parsed.body

    // SECURITY: Sanitize structured signup fields (password bounded separately — do not HTML-strip secrets).
    // OWASP Reference: A03:2021 Injection
    const name = sanitizeString(b.name, 200)
    const email = sanitizeString(b.email, 320).trim()
    const password =
      typeof b.password === 'string' ? b.password.slice(0, 256).replace(/\x00/g, '') : ''

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with related records
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        usage: {
          create: {
            chatsToday: 0,
            examsThisMonth: 0,
            validationsThisMonth: 0,
            writesThisMonth: 0,
          },
        },
        subscription: {
          create: {
            plan: 'free',
            status: 'active',
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, userId: user.id, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
