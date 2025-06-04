import { NextResponse } from 'next/server'
import { PrismaClient, IssueStatus } from '../../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const issueId = params.id

    // Validate status
    const validStatuses = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the current issue
    const currentIssue = await prisma.issue.findUnique({
      where: { id: issueId }
    })

    if (!currentIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Update the issue status
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: status as IssueStatus,
        resolvedAt: status === 'RESOLVED' ? new Date() : null
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
    if (currentIssue.status !== status) {
      await prisma.issueUpdate.create({
        data: {
          issueId: issueId,
          message: `Status changed from ${currentIssue.status.replace('_', ' ')} to ${status.replace('_', ' ')}`,
          oldStatus: currentIssue.status,
          newStatus: status as IssueStatus,
          updatedById: currentIssue.reportedById // In real app, use current user ID
        }
      })
    }

    return NextResponse.json(updatedIssue)
  } catch (error) {
    console.error('Error updating issue status:', error)
    return NextResponse.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    )
  }
} 