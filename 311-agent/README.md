# Municipal Issue Management Dashboard

A comprehensive web application for municipal managers to view, track, and manage city issues like potholes, graffiti, street lighting problems, and more on an interactive map.

## Features

### ✅ **Phase 1: Core Dashboard (Complete)**
- **Interactive Map Dashboard** with Mapbox integration
- **Color-coded Issue Markers** by category (Potholes, Graffiti, Street Lighting, etc.)
- **Issue Filtering** by category and status
- **Real-time Statistics** showing urgent issues, in-progress work, and completion rates
- **Detailed Issue Information** with popups showing full issue details
- **Priority System** with visual indicators (urgent issues pulse on the map)
- **Status Tracking** (Reported → In Progress → Resolved)

### ✅ **Phase 2: User Management & Assignment (Complete)**
- **Role-based Authentication** (Municipal Manager, Department Workers, Admin)
- **Demo Sign-in System** with 3 different user personas
- **Issue Assignment** - Managers can assign issues to specific workers
- **Assignment Filtering** - Filter by "My Issues", "Unassigned", etc.
- **Status Management** - Workers can update issue status
- **Audit Trail** - Complete tracking of assignments and status changes
- **Permission System** - Different capabilities based on user role

### ✅ **Phase 3: Advanced Features (Complete)**
- **Add New Issues** - Comprehensive form for reporting new municipal issues
- **Photo Upload** - Upload up to 5 photos per issue with preview
- **Issue Detail Pages** - Full issue view with photos, timeline, and updates
- **Comment System** - Add updates and comments to issues
- **Activity Timeline** - Visual timeline of issue lifecycle
- **Location Integration** - Google Maps links and coordinate display
- **Advanced Navigation** - Clickable issue titles and breadcrumb navigation

## 🚀 **How to Use**

### **1. Access the Dashboard**
```bash
npm run dev
```
Visit: `http://localhost:3000/auth/signin`

### **2. Choose Your Role**
- **🔵 Municipal Manager** - Full system access, can assign issues
- **🟢 Public Works Worker** - Manage infrastructure issues  
- **🟣 Parks & Recreation Worker** - Handle park and recreation issues

### **3. Key Workflows**

#### **For Managers:**
1. **Dashboard Overview** - See all issues, statistics, and assignments
2. **Assign Issues** - Click "Assign" on any issue to delegate to workers
3. **Add New Issues** - Click "+ Add Issue" to report new problems
4. **Monitor Progress** - Filter by status, priority, and assignment

#### **For Workers:**
1. **View My Issues** - Filter dashboard to show only assigned issues
2. **Update Status** - Change issue status as work progresses
3. **Add Comments** - Provide updates on progress
4. **View Details** - Click issue titles for full information

#### **Adding Issues:**
1. **Issue Details** - Title, category, priority, description
2. **Location** - Coordinates (use "Demo Location" button for testing)
3. **Photos** - Upload images to document the issue
4. **Submit** - Issue appears on map immediately

## Database Schema

### **Core Models**
- **Issues** - Municipal problems with location, priority, status, photos
- **Categories** - Issue types with custom colors for map markers
- **Users** - Municipal staff with roles and departments
- **Assignments** - Issue delegation and tracking
- **Updates** - Comment and change history
- **Photos** - Image attachments for issues

### **Issue Lifecycle**
```
REPORTED → IN_PROGRESS → RESOLVED
    ↓           ↓            ↓
Assignment  Status      Resolution
Tracking    Updates     Completion
```

## Issue Categories

Each category has distinct visual styling:

| Category | Color | Icon | Description |
|----------|-------|------|-------------|
| 🔴 Potholes | Red | Road damage | Surface damage and holes |
| 🟠 Debris/Trash | Orange | Waste | Litter and cleanup needs |
| 🟣 Graffiti | Purple | Vandalism | Graffiti removal |
| 🟡 Road Damage | Yellow | Construction | General road maintenance |
| 🔵 Street Lighting | Blue | Lighting | Broken/malfunctioning lights |
| 🟢 Trees/Vegetation | Green | Nature | Tree and vegetation issues |
| 🔷 Water/Sewer | Dark Blue | Utilities | Water and drainage problems |

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Map**: Mapbox GL JS with custom markers and popups
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with demo user system
- **File Upload**: Local file storage (photos)
- **Routing**: Next.js App Router with dynamic routes

## API Endpoints

### **Issues**
- `GET /api/issues` - List all issues with relations
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get issue details with photos/updates
- `POST /api/issues/[id]/assign` - Assign issue to user
- `POST /api/issues/[id]/status` - Update issue status
- `POST /api/issues/[id]/comments` - Add comment/update

### **Categories & Users**
- `GET /api/categories` - List all issue categories
- `GET /api/users` - List users or get by email
- `POST /api/issues/photos` - Upload issue photos

## Project Structure

```
311-agent/
├── src/
│   ├── app/
│   │   ├── dashboard/              # Main dashboard
│   │   │   ├── add-issue/         # New issue form
│   │   │   └── issue/[id]/        # Issue detail pages
│   │   ├── auth/signin/           # Authentication
│   │   └── api/                   # Backend API routes
│   ├── components/
│   │   └── MapComponent.tsx       # Interactive map
│   └── lib/                       # Utilities
├── prisma/
│   ├── schema.prisma             # Complete database schema
│   ├── seed.ts                   # Test data
│   └── migrations/               # Database migrations
├── public/uploads/issues/        # Photo storage
└── generated/prisma/             # Generated client
```

## Quick Start

### **1. Installation**
```bash
git clone [repository]
cd 311-agent
npm install
```

### **2. Database Setup**
```bash
npx prisma migrate dev
npm run db:seed
```

### **3. Optional: Mapbox Setup**
```bash
# Create .env.local
echo "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here" >> .env.local
```

### **4. Launch**
```bash
npm run dev
```

## Advanced Features

### **Photo Management**
- **Upload**: Up to 5 photos per issue
- **Validation**: Image files only, max 5MB each
- **Storage**: Local filesystem (production: cloud storage)
- **Display**: Grid view with click-to-expand

### **Audit Trail**
- **Assignment Changes** - Track who assigned what to whom
- **Status Updates** - Log all status transitions
- **Comments** - Timestamped updates from users
- **Timeline View** - Visual representation of issue lifecycle

### **Search & Filtering**
- **Category Filter** - Show specific issue types
- **Status Filter** - Filter by completion stage
- **Assignment Filter** - "My Issues", "Unassigned", specific users
- **Combined Filters** - Stack multiple filters

### **Role-Based Access**
- **Managers** - Full access, assignment capabilities
- **Workers** - Assigned issues, status updates
- **Security** - Demo system for testing, production-ready auth structure

## Demo Data

The system includes realistic test data:
- **7 Categories** with unique colors and descriptions
- **3 Users** representing different roles and departments
- **6 Sample Issues** with varying priorities and statuses
- **NYC Coordinates** for realistic mapping
- **Assignment Examples** showing workflow

## Production Deployment

### **Database**
- **Production**: PostgreSQL, MySQL, or SQLite
- **Hosting**: Railway, PlanetScale, or AWS RDS
- **Migrations**: `npx prisma migrate deploy`

### **File Storage**
- **Images**: AWS S3, Cloudinary, or Vercel Blob
- **Configuration**: Update `/api/issues/photos` endpoint

### **Authentication**
- **OAuth**: GitHub, Google, Microsoft
- **Enterprise**: SAML, Active Directory
- **Configuration**: Update `src/auth.ts`

### **Map Service**
- **Free Tier**: 50,000 monthly map loads
- **Production**: Mapbox paid plan
- **Alternative**: Google Maps, OpenStreetMap

---

**🏛️ Built for Municipal Efficiency**  
*Streamline your city's issue management with modern tools and comprehensive workflows.*

**🎯 Status: Production Ready**  
*All three phases complete with full functionality for municipal operations.*
