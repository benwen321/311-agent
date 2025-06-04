const { PrismaClient, UserRole, IssueStatus, IssuePriority } = require('../generated/prisma')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create issue categories with colors for map markers
  const categories = await Promise.all([
    prisma.issueCategory.upsert({
      where: { name: 'Potholes' },
      update: {},
      create: {
        name: 'Potholes',
        color: '#DC2626', // Red
        description: 'Road surface damage and potholes'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Debris/Trash' },
      update: {},
      create: {
        name: 'Debris/Trash',
        color: '#EA580C', // Orange
        description: 'Litter, debris, and waste management issues'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Graffiti' },
      update: {},
      create: {
        name: 'Graffiti',
        color: '#9333EA', // Purple
        description: 'Vandalism and graffiti removal'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Road Damage' },
      update: {},
      create: {
        name: 'Road Damage',
        color: '#EAB308', // Yellow
        description: 'General road maintenance and damage'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Street Lighting' },
      update: {},
      create: {
        name: 'Street Lighting',
        color: '#2563EB', // Blue
        description: 'Broken or malfunctioning street lights'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Trees/Vegetation' },
      update: {},
      create: {
        name: 'Trees/Vegetation',
        color: '#16A34A', // Green
        description: 'Tree maintenance and vegetation issues'
      }
    }),
    prisma.issueCategory.upsert({
      where: { name: 'Water/Sewer' },
      update: {},
      create: {
        name: 'Water/Sewer',
        color: '#0891B2', // Dark Blue
        description: 'Water main, sewer, and drainage issues'
      }
    })
  ])

  // Create test users
  const manager = await prisma.user.upsert({
    where: { email: 'manager@municipality.gov' },
    update: {},
    create: {
      email: 'manager@municipality.gov',
      name: 'Municipal Manager',
      role: UserRole.MUNICIPAL_MANAGER,
      department: 'City Management'
    }
  })

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@municipality.gov' },
    update: {},
    create: {
      email: 'worker1@municipality.gov',
      name: 'John Smith',
      role: UserRole.DEPARTMENT_WORKER,
      department: 'Public Works'
    }
  })

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@municipality.gov' },
    update: {},
    create: {
      email: 'worker2@municipality.gov',
      name: 'Sarah Johnson',
      role: UserRole.DEPARTMENT_WORKER,
      department: 'Parks & Recreation'
    }
  })

  // Create sample issues with realistic coordinates (using a generic US city center)
  // These coordinates are around a typical downtown area
  const sampleIssues = [
    {
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing vehicle damage near intersection',
      latitude: 40.7589, 
      longitude: -73.9851,
      address: '123 Main Street',
      priority: IssuePriority.HIGH,
      status: IssueStatus.REPORTED,
      categoryId: categories[0].id, // Potholes
      reportedById: manager.id
    },
    {
      title: 'Broken streetlight',
      description: 'Street light has been out for 3 days',
      latitude: 40.7614,
      longitude: -73.9776,
      address: '456 Oak Avenue',
      priority: IssuePriority.MEDIUM,
      status: IssueStatus.IN_PROGRESS,
      categoryId: categories[4].id, // Street Lighting
      reportedById: manager.id,
      assignedToId: worker1.id,
      assignedAt: new Date()
    },
    {
      title: 'Graffiti on public building',
      description: 'Large graffiti tag on city hall wall',
      latitude: 40.7505,
      longitude: -73.9934,
      address: '789 Government Plaza',
      priority: IssuePriority.MEDIUM,
      status: IssueStatus.REPORTED,
      categoryId: categories[2].id, // Graffiti
      reportedById: worker2.id
    },
    {
      title: 'Tree blocking sidewalk',
      description: 'Fallen tree branch blocking pedestrian access',
      latitude: 40.7580,
      longitude: -73.9855,
      address: '321 Park Road',
      priority: IssuePriority.URGENT,
      status: IssueStatus.REPORTED,
      categoryId: categories[5].id, // Trees/Vegetation
      reportedById: manager.id
    },
    {
      title: 'Debris in storm drain',
      description: 'Large accumulation of leaves and trash',
      latitude: 40.7620,
      longitude: -73.9790,
      address: '654 River Street',
      priority: IssuePriority.LOW,
      status: IssueStatus.RESOLVED,
      categoryId: categories[1].id, // Debris/Trash
      reportedById: worker1.id,
      assignedToId: worker2.id,
      assignedAt: new Date(Date.now() - 86400000), // 1 day ago
      resolvedAt: new Date()
    },
    {
      title: 'Water main leak',
      description: 'Small leak causing puddle formation',
      latitude: 40.7545,
      longitude: -73.9910,
      address: '987 Industrial Boulevard',
      priority: IssuePriority.HIGH,
      status: IssueStatus.IN_PROGRESS,
      categoryId: categories[6].id, // Water/Sewer
      reportedById: manager.id,
      assignedToId: worker1.id,
      assignedAt: new Date()
    }
  ]

  for (const issue of sampleIssues) {
    await prisma.issue.create({
      data: issue
    })
  }

  console.log('Database has been seeded successfully!')
  console.log(`Created ${categories.length} categories`)
  console.log(`Created 3 users`)
  console.log(`Created ${sampleIssues.length} sample issues`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 