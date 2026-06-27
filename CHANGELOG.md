# Changelog

All notable changes to SVG Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-06-27

### Added
- Initial release of SVG Studio backend infrastructure
- SQLite database with Prisma ORM integration
- Database schema with 4 tables (Categories, Shapes, ShapeHistory, Settings)
- RESTful API with Express.js server
- 80 pre-loaded SVG assets across 6 categories:
  - Waves: 10 shapes
  - Blobs: 10 shapes
  - Shapes: 40 shapes
  - Dividers: 8 shapes
  - Frames: 6 shapes
  - Borders: 6 shapes
- Complete CRUD operations for shapes
- Category management API endpoints
- SVG validation and sanitization utilities
- Shape history tracking for audit trail
- Error handling and logging system
- Database seeding script
- Automatic Prisma migrations
- Environment variable configuration
- Comprehensive API documentation

### Backend Features
- `GET /api/categories` - List all categories with shape counts
- `GET /api/shapes` - Get all shapes with filtering and search
- `POST /api/shapes` - Create new custom shapes
- `PUT /api/shapes/:id` - Update existing shapes
- `DELETE /api/shapes/:id` - Delete shapes
- Health check endpoint `/health`

### Security
- SVG content sanitization
- XSS protection (script removal)
- File size validation (max 512KB)
- Input validation for all API endpoints
- SQL injection prevention via Prisma

### Developer Experience
- Prisma Studio integration for visual database management
- Hot-reload development server with nodemon
- Structured logging to file and console
- Clean project structure with separation of concerns

### Known Limitations
- UI still uses hardcoded SVG array (needs migration to API)
- No upload functionality in UI yet
- No shape management UI (edit/delete buttons)
- Backend runs separately from Figma plugin

### Technical Details
- Node.js backend with Express.js
- Prisma ORM v6.19.3
- SQLite database
- Better-sqlite3 driver
- CORS enabled for Figma integration
- Compression middleware for API responses

### Git Strategy
- **NOT committed**: Database files, migrations, generated code, logs
- **Committed**: Schema (prisma/schema.prisma), source code, documentation
- **Why**: Local-only app - each machine generates its own database
- **Setup**: Run `npm run db:migrate && npm run db:seed` on new machine

## [0.0.2] - 2026-06-27

### Added
- **Full API Integration**: UI now loads all shapes dynamically from backend API
- **SVG Upload Functionality**: Complete upload system with drag-and-drop support
  - Drag-and-drop area for easy file upload
  - File validation (SVG only, max 512KB)
  - Real-time SVG preview before saving
  - Category selection dropdown
  - Tags input for better organization
  - Auto-fills shape name from filename
- **Shape Management**: Delete custom shapes directly from UI
- **Loading States**: Professional loading spinners and feedback
- **Real-time Category Counts**: Category counts update dynamically from database
- **Backend Status Indicator**: Visual indicator showing backend connection status
- **Error Handling**: Graceful error messages when backend is offline
- **Empty State**: User-friendly message when no shapes match filters

### Changed
- UI no longer uses hardcoded ASSETS array
- All shape data now comes from SQLite database via API
- Categories are loaded dynamically from backend
- Search and filtering now use API endpoints
- Backend connection check on plugin load

### Improved
- Better error messages for offline backend
- Toast notifications for user actions
- Smooth transitions and loading states
- Professional modal design for uploads

### Technical Details
- API Base URL: `http://localhost:3456`
- Endpoints used: `/health`, `/api/categories`, `/api/shapes`
- Upload endpoint: `POST /api/shapes`
- Delete endpoint: `DELETE /api/shapes/:id`

## [Unreleased] - Next Version (0.0.3)

### Planned
- Edit shape functionality
- Bulk operations (delete multiple shapes)
- Export shapes collection to ZIP
- Import shapes from files/URLs
- Shape favorites and collections
- Usage statistics and analytics

## Future Roadmap

### v0.1.0
- Backup and restore utilities
- Export shapes collection to ZIP
- Import shapes from files/URLs
- Shape favorites and collections
- Usage statistics and analytics
- Dark/light theme toggle
- Performance optimizations

### v0.2.0
- Multi-user support
- Cloud sync (optional)
- Collaboration features
- Version control for shapes
- AI-powered shape search
- Auto-categorization
- Shape recommendations

---

**Note**: This is a beta release (v0.0.1). The backend is production-ready, but UI integration is still in progress.
