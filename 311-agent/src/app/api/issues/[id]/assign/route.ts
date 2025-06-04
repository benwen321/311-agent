import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { assignedToId } = await request.json()
    const issueId = params.id

    // Get the current issue to track changes
    const currentIssue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { assignedTo: true }
    })

    if (!currentIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Update the issue assignment
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: assignedToId || null,
        assignedAt: assignedToId ? new Date() : null,
        // Auto-update status when assigning
        status: assignedToId ? 'IN_PROGRESS' : 'REPORTED'
      },
      include: {
        category: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        },
        assignedTo: {
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

    // Create an audit trail entry
    const oldAssignee = currentIssue.assignedTo?.name || 'Unassigned'
    const newAssignee = updatedIssue.assignedTo?.name || 'Unassigned'
    
    if (oldAssignee !== newAssignee) {
      await prisma.issueUpdate.create({
        data: {
          issueId: issueId,
          message: `Assignment changed from ${oldAssignee} to ${newAssignee}`,
          oldStatus: currentIssue.status,
          newStatus: updatedIssue.status,
          updatedById: currentIssue.reportedById // In real app, use current user ID
        }
      })
    }

    return NextResponse.json(updatedIssue)
  } catch (error) {
    console.error('Error assigning issue:', error)
    return NextResponse.json(
      { error: 'Failed to assign issue' },
      { status: 500 }
    )
  }
} 