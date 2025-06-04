import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const issueId = params.id

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
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
        },
        photos: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        updates: {
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
} 