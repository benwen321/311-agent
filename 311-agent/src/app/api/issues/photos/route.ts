import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const issueId = formData.get('issueId') as string

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 })
    }

    // Verify issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const uploadedPhotos: string[] = []

    // Process each uploaded file
    for (let i = 0; i < 5; i++) { // Max 5 photos
      const file = formData.get(`photo${i}`) as File
      if (!file) continue

      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue // Skip files larger than 5MB
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const fileExtension = path.extname(file.name)
      const fileName = `${issueId}_${Date.now()}_${i}${fileExtension}`
      
      // For demo purposes, we'll save to public/uploads
      // In production, you'd use cloud storage like AWS S3, Cloudinary, etc.
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'issues')
      
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }

      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      const publicUrl = `/uploads/issues/${fileName}`
      uploadedPhotos.push(publicUrl)

      // Save photo record to database
      await prisma.issuePhoto.create({
        data: {
          issueId: issueId,
          url: publicUrl,
          caption: `Photo ${i + 1} for issue ${issue.title}`
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      uploadedPhotos,
      count: uploadedPhotos.length 
    })

  } catch (error) {
    console.error('Error uploading photos:', error)
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 })
    }

    const photos = await prisma.issuePhoto.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
} 