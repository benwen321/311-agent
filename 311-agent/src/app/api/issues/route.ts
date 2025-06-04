import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const issues = await prisma.issue.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const issue = await prisma.issue.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        address: body.address,
        priority: body.priority,
        categoryId: body.categoryId,
        reportedById: body.reportedById
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

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
} 