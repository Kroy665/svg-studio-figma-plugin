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

## [Unreleased] - Next Version (0.0.2)

### Planned
- Integrate UI with backend API
- Add SVG upload functionality in plugin UI
- Real-time shape preview
- Shape management UI (edit, delete, favorite)
- Category filtering in UI
- Search functionality in UI
- Error handling in UI
- Loading states and feedback

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
