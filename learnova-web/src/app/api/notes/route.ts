import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import {
  sanitizeArray,
  sanitizeJsonPostBody,
  sanitizeString,
} from '@/lib/validation'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch all study notes for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    // SECURITY: Sanitize query parameters before Prisma filters.
    // OWASP Reference: A03:2021 Injection
    const folder = sanitizeString(searchParams.get('folder'), 120)
    const subject = sanitizeString(searchParams.get('subject'), 120)

    const where: any = { userId: user.id }
    if (folder) where.folder = folder
    if (subject) where.subject = subject

    const notes = await prisma.studyNote.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST - Create a new study note
export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {}
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'title',
      'content',
      'subject',
      'topic',
      'folder',
      'sourceType',
      'sourceId',
      'tags',
    ])
    if (!parsed.ok) return parsed.response

    const b = parsed.body

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const title = sanitizeString(b.title, 500)
    const content = sanitizeString(b.content, 100000)
    const subject = sanitizeString(b.subject, 200)
    const topic = sanitizeString(b.topic, 300)
    const folder = sanitizeString(b.folder, 120) || 'General'
    const sourceType = sanitizeString(b.sourceType, 64)
    const sourceId = sanitizeString(b.sourceId, 128)
    const tags = sanitizeArray(b.tags, 50, 80)

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const note = await prisma.studyNote.create({
      data: {
        userId: user.id,
        title,
        content,
        subject: subject || null,
        topic: topic || null,
        folder,
        sourceType,
        sourceId: sourceId || null,
        tags,
      },
    })

    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

// PUT - Update a study note
export async function PUT(req: NextRequest) {
  try {
    let rawBody: unknown = {}
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'id',
      'title',
      'content',
      'subject',
      'topic',
      'folder',
      'tags',
    ])
    if (!parsed.ok) return parsed.response

    const b = parsed.body
    const tagsProvided = 'tags' in b
    const subjectProvided = 'subject' in b
    const topicProvided = 'topic' in b

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const id = sanitizeString(b.id, 128)
    const title = sanitizeString(b.title, 500)
    const content = sanitizeString(b.content, 100000)
    const subject = sanitizeString(b.subject, 200)
    const topic = sanitizeString(b.topic, 300)
    const folder = sanitizeString(b.folder, 120)
    const tags = sanitizeArray(b.tags, 50, 80)

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existingNote = await prisma.studyNote.findUnique({
      where: { id },
    })

    if (!existingNote || existingNote.userId !== user.id) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const note = await prisma.studyNote.update({
      where: { id },
      data: {
        title: title || existingNote.title,
        content: content || existingNote.content,
        subject: subjectProvided ? subject : existingNote.subject,
        topic: topicProvided ? topic : existingNote.topic,
        folder: folder || existingNote.folder,
        tags: tagsProvided ? tags : existingNote.tags,
      },
    })

    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE - Delete a study note
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    // SECURITY: Sanitize identifier from query string.
    // OWASP Reference: A03:2021 Injection
    const id = sanitizeString(searchParams.get('id'), 128)

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existingNote = await prisma.studyNote.findUnique({
      where: { id },
    })

    if (!existingNote || existingNote.userId !== user.id) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await prisma.studyNote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
