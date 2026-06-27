# SVG Studio v0.0.1 - Setup Guide

Quick setup guide for SVG Studio Figma Plugin with Database.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create database and run migrations
npm run db:migrate

# Seed with 80 SVG shapes
npm run db:seed
```

### 3. Start Backend Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at: `http://localhost:3456`

### 4. Load Plugin in Figma
1. Open Figma Desktop App
2. Navigate to: **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from this directory
4. Click **Run** to test the plugin

## ✅ Verify Installation

### Test Backend API
```bash
# Health check
curl http://localhost:3456/health

# Get all categories
curl http://localhost:3456/api/categories

# Get shapes
curl http://localhost:3456/api/shapes
```

### Open Prisma Studio
```bash
npm run db:studio
```
Opens visual database editor at `http://localhost:5555`

## 📁 Project Structure

```
Figma_plugin/
├── backend/              # Express.js API server
├── prisma/               # Database schema & migrations
├── storage/
│   ├── database/         # SQLite database file
│   └── logs/             # Application logs
├── manifest.json         # Figma plugin config
├── code.js              # Plugin main code
├── ui.html              # Plugin UI
└── .env                 # Environment variables
```

## 🔧 Configuration

Copy `.env.example` to `.env` and customize:

```env
NODE_ENV=development
PORT=3456
DATABASE_URL="file:./storage/database/svg_studio.db"
```

## 📊 Database Info

- **Type**: SQLite
- **ORM**: Prisma
- **Location**: `storage/database/svg_studio.db`
- **Tables**: Categories, Shapes, ShapeHistory, Settings
- **Pre-loaded**: 80 SVG assets

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm run db:studio        # Visual database editor

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npx prisma generate      # Regenerate Prisma client

# Production
npm start                # Start server

# Maintenance
npm run backup           # Backup database
npm run restore          # Restore database
```

## 🌐 API Endpoints

Base URL: `http://localhost:3456`

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID

### Shapes
- `GET /api/shapes` - Get all shapes
- `GET /api/shapes?category=waves` - Filter by category
- `GET /api/shapes?search=heart` - Search shapes
- `GET /api/shapes/:id` - Get shape by ID
- `POST /api/shapes` - Create new shape
- `PUT /api/shapes/:id` - Update shape
- `DELETE /api/shapes/:id` - Delete shape

## 📦 Example: Create Custom Shape

```bash
curl -X POST http://localhost:3456/api/shapes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Circle",
    "category": "custom",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#FF6B6B\"/></svg>",
    "tags": ["custom", "red", "circle"],
    "is_custom": true
  }'
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Change PORT in .env
PORT=3457
```

### Database not found
```bash
npm run db:migrate
npm run db:seed
```

### Prisma Client errors
```bash
npx prisma generate
```

### Server won't start
```bash
# Check logs
cat storage/logs/app.log

# Verify database exists
ls -la storage/database/
```

## 📚 Next Steps

1. ✅ Backend is running
2. ⏳ Integrate UI with API (v0.0.2)
3. ⏳ Add upload functionality
4. ⏳ Add shape management UI

## 🆘 Support

- Check `README.md` for full documentation
- See `CHANGELOG.md` for version history
- Review `IMPLEMENTATION_PLAN.md` for technical details

## 📋 Version 0.0.1 Checklist

- [x] Database setup complete
- [x] Backend API working
- [x] 80 shapes seeded
- [x] All CRUD operations functional
- [x] Prisma Studio accessible
- [x] Logging enabled
- [ ] UI connected to API (next version)
- [ ] Upload functionality (next version)

---

**Ready to develop!** 🎉

Your backend is fully operational. Next step: integrate the UI to fetch shapes from the API instead of the hardcoded array.
