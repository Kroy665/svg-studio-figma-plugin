# SVG Studio v0.0.1 - Figma Plugin with Database

Production-grade Figma plugin for managing and inserting SVG assets with **Prisma ORM** and **SQLite database**.

> **Version**: 0.0.1
> **Status**: Beta - Backend Complete, UI Integration In Progress

## ✨ Features

- 🗄️ **SQLite Database** with Prisma ORM
- 📦 **80 Pre-loaded SVG Assets** (waves, blobs, shapes, dividers, frames, borders)
- 🚀 **RESTful API** for shape management
- ✅ **SVG Validation & Sanitization**
- 📤 **Upload Custom SVGs** (coming soon in UI)
- 🔍 **Search & Filter** shapes
- 📊 **Category Management**
- 📝 **History Tracking** for all changes
- 🔒 **Production-ready** error handling and logging

## 📁 Project Structure

```
Figma_plugin/
├── backend/                  # Express.js backend
│   ├── server.js            # Main server file
│   ├── prisma.js            # Prisma client
│   ├── config.js            # Configuration
│   ├── routes/
│   │   ├── shapes.js        # Shape CRUD endpoints
│   │   └── categories.js    # Category endpoints
│   └── utils/
│       ├── svgValidator.js  # SVG validation
│       └── logger.js        # Logging utility
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.js              # Database seeding script
│   └── migrations/          # Migration history
├── storage/
│   ├── database/
│   │   └── svg_studio.db    # SQLite database
│   └── logs/
│       └── app.log          # Application logs
├── code.js                  # Figma plugin code
├── ui.html                  # Plugin UI
├── manifest.json            # Figma manifest
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Figma_plugin
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (default values work fine)
```

### 3. Initialize Database

```bash
# Create database schema
npm run db:migrate

# Seed with 80 SVG shapes
npm run db:seed
```

This creates:
- `storage/database/svg_studio.db` - SQLite database
- `prisma/migrations/` - Migration history
- `generated/prisma/` - Prisma client

**Note**: These files are gitignored and must be generated on each machine.

### 4. Start Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3456`

### 5. Load Plugin in Figma

1. Open Figma Desktop App
2. Go to Plugins → Development → Import plugin from manifest
3. Select `manifest.json` from this directory
4. Run the plugin!

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Categories
```bash
GET  /api/categories        # Get all categories with counts
GET  /api/categories/:id    # Get category by ID
```

### Shapes
```bash
GET    /api/shapes                    # Get all shapes
GET    /api/shapes?category=waves     # Filter by category
GET    /api/shapes?search=cloud       # Search shapes
GET    /api/shapes/:id                # Get shape by ID
POST   /api/shapes                    # Create new shape
PUT    /api/shapes/:id                # Update shape
DELETE /api/shapes/:id                # Delete shape
```

## 🧪 Testing API

```bash
# Get all categories
curl http://localhost:3456/api/categories

# Get waves
curl http://localhost:3456/api/shapes?category=waves

# Search for "heart"
curl http://localhost:3456/api/shapes?search=heart

# Create a new shape
curl -X POST http://localhost:3456/api/shapes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Shape",
    "category": "custom",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#FF6B6B\"/></svg>",
    "tags": ["custom", "circle"],
    "is_custom": true
  }'
```

## 🗄️ Database Schema

### Categories Table
- id, name, displayName, description, sortOrder
- timestamps (createdAt, updatedAt)

### Shapes Table
- id, name, categoryId, svgContent, width, height, tags, isCustom
- timestamps (createdAt, updatedAt)

### ShapeHistory Table
- id, shapeId, action, userNote, timestamp

### Settings Table
- key, value, description, updatedAt

## 🛠️ Available Scripts

```bash
npm run dev         # Start backend with nodemon (auto-reload)
npm start           # Start backend in production
npm run db:migrate  # Run Prisma migrations
npm run db:seed     # Seed database with initial data
npm run db:studio   # Open Prisma Studio (visual database editor)
```

## 🎨 Prisma Studio

View and edit your database visually:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

## 📊 Current Database Stats

- **Categories**: 8 (All, Waves, Blobs, Shapes, Dividers, Frames, Borders, Custom)
- **Shapes**: 80 pre-loaded SVG assets
  - Waves: 10
  - Blobs: 10
  - Shapes: 40
  - Dividers: 8
  - Frames: 6
  - Borders: 6

## 🔐 Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3456
HOST=localhost
DATABASE_URL="file:./storage/database/svg_studio.db"
MAX_SVG_SIZE=524288
ALLOWED_ORIGINS=http://localhost:*,https://www.figma.com
LOG_LEVEL=info
```

## 🚧 Version 0.0.1 Status

### ✅ Completed
- [x] SQLite database with Prisma ORM
- [x] Database schema (Categories, Shapes, History, Settings)
- [x] RESTful API backend
- [x] 80 pre-loaded SVG assets
- [x] SVG validation and sanitization
- [x] CRUD operations for shapes
- [x] Category management API
- [x] History tracking
- [x] Error handling and logging
- [x] Seed script for initial data
- [x] API documentation

### 🚧 In Progress (v0.0.2)
- [ ] Update UI to load shapes from API
- [ ] Add upload functionality in UI
- [ ] Add delete/edit buttons in UI
- [ ] Real-time shape preview
- [ ] Category management UI

### 📋 Planned (v0.1.0)
- [ ] Backup/restore utilities
- [ ] Export shapes to ZIP
- [ ] Import from external sources
- [ ] Shape favorites/collections
- [ ] Usage analytics
- [ ] Dark/light theme toggle

## 🐛 Troubleshooting

### Database not found
```bash
npm run db:migrate
npm run db:seed
```

### Port already in use
Change `PORT` in `.env` file

### Prisma Client not generated
```bash
npx prisma generate
```

## 🔒 What's in Git vs Local Only

### ✅ Committed to Git:
- Source code (backend/, prisma/schema.prisma)
- Plugin files (manifest.json, code.js, ui.html)
- Configuration templates (.env.example)
- Documentation (README.md, etc.)
- Scripts and utilities

### ❌ NOT in Git (local only):
- `.env` - Your environment variables
- `storage/database/*.db` - SQLite database files
- `prisma/migrations/` - Migration files (regenerated on setup)
- `generated/prisma/` - Prisma client (auto-generated)
- `node_modules/` - Dependencies
- `storage/logs/*.log` - Log files

**Why?** This is a local-only application. Each developer generates their own database and migrations. The schema in `prisma/schema.prisma` is the source of truth.

### 🔄 Setting up on a new machine:
1. Clone the repo
2. `npm install`
3. `cp .env.example .env`
4. `npm run db:migrate` (creates database & migrations)
5. `npm run db:seed` (adds initial data)
6. `npm run dev` (start server)

## 📝 License

MIT

---

## 📦 Version History

### v0.0.1 (Current) - Initial Release
- ✅ Backend infrastructure complete
- ✅ Database with Prisma ORM
- ✅ RESTful API
- ✅ 80 pre-loaded SVG assets
- ✅ Full CRUD operations
- 🚧 UI integration pending

---

**Built with**: Node.js, Express, Prisma, SQLite, Figma Plugin API
**Author**: Koushik Roy
**Created**: June 2026
