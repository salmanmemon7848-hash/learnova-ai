import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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
    const folder = searchParams.get('folder')
    const subject = searchParams.get('subject')

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

    const body = await req.json()
    const { title, content, subject, topic, folder = 'General', sourceType, sourceId, tags = [] } = body

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

    const body = await req.json()
    const { id, title, content, subject, topic, folder, tags } = body

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
        subject: subject !== undefined ? subject : existingNote.subject,
        topic: topic !== undefined ? topic : existingNote.topic,
        folder: folder || existingNote.folder,
        tags: tags || existingNote.tags,
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
    const id = searchParams.get('id')

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
