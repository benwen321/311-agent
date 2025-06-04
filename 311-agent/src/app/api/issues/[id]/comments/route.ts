import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message, updatedById } = await request.json()
    const issueId = params.id

    if (!message || !updatedById) {
      return NextResponse.json({ error: 'Message and updatedById are required' }, { status: 400 })
    }

    // Verify issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Create the update
    const update = await prisma.issueUpdate.create({
      data: {
        issueId: issueId,
        message: message,
        updatedById: updatedById,
        oldStatus: issue.status,
        newStatus: issue.status
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
} 