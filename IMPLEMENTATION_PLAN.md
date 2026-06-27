# SVG Studio - Production Implementation Plan

## Overview
Transform the Figma plugin into a production-level application with persistent storage, custom SVG uploads, and comprehensive shape management.

## Architecture

### Technology Stack
- **Database**: SQLite3 (lightweight, serverless, perfect for local use)
- **Backend**: Node.js with Express (lightweight HTTP server)
- **Frontend**: Enhanced HTML/CSS/JS with modern features
- **Storage**: File system for SVG files + SQLite for metadata
- **Communication**: Plugin UI ↔ Backend via HTTP/fetch API

---

## Database Schema

### Tables

#### 1. **categories**
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **shapes**
```sql
CREATE TABLE shapes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  svg_content TEXT NOT NULL,
  thumbnail_data TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT, -- JSON array of tags
  is_custom BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_shapes_category ON shapes(category_id);
CREATE INDEX idx_shapes_name ON shapes(name);
CREATE INDEX idx_shapes_custom ON shapes(is_custom);
```

#### 3. **shape_history**
```sql
CREATE TABLE shape_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shape_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  user_note TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shape_id) REFERENCES shapes(id) ON DELETE CASCADE
);
```

#### 4. **settings**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Folder Structure

```
Figma_plugin/
├── manifest.json                 # Figma plugin manifest
├── code.js                       # Plugin code (main thread)
├── ui.html                       # Plugin UI
├── package.json                  # Node.js dependencies
├── .gitignore                    # Git ignore file
├── README.md                     # Documentation
├── IMPLEMENTATION_PLAN.md        # This file
│
├── backend/                      # Backend service
│   ├── server.js                 # Express server entry point
│   ├── database.js               # SQLite connection & queries
│   ├── routes/
│   │   ├── shapes.js             # Shape CRUD endpoints
│   │   ├── categories.js         # Category endpoints
│   │   └── upload.js             # Upload endpoints
│   ├── middleware/
│   │   ├── validation.js         # Input validation
│   │   ├── sanitization.js       # SVG sanitization
│   │   └── errorHandler.js       # Error handling
│   ├── utils/
│   │   ├── svgValidator.js       # SVG validation utilities
│   │   ├── logger.js             # Logging utility
│   │   └── backup.js             # Database backup utility
│   └── config.js                 # Configuration
│
├── storage/                      # Data storage
│   ├── database/
│   │   ├── svg_studio.db         # SQLite database
│   │   └── backups/              # Database backups
│   ├── assets/
│   │   ├── waves/                # SVG files by category
│   │   ├── blobs/
│   │   ├── shapes/
│   │   ├── dividers/
│   │   ├── frames/
│   │   ├── borders/
│   │   └── custom/               # User-uploaded SVGs
│   └── logs/
│       └── app.log               # Application logs
│
├── scripts/                      # Utility scripts
│   ├── init-db.js                # Initialize database
│   ├── migrate-data.js           # Migrate existing SVGs to DB
│   ├── seed-db.js                # Seed with initial data
│   └── backup-restore.js         # Backup/restore utilities
│
└── tests/                        # Test files
    ├── api.test.js               # API endpoint tests
    ├── database.test.js          # Database tests
    └── svg-validation.test.js    # SVG validation tests
```

---

## API Endpoints

### Shapes
- `GET /api/shapes` - Get all shapes (with filters)
- `GET /api/shapes/:id` - Get shape by ID
- `POST /api/shapes` - Create new shape (upload)
- `PUT /api/shapes/:id` - Update shape
- `DELETE /api/shapes/:id` - Delete shape
- `GET /api/shapes/search?q=...` - Search shapes

### Categories
- `GET /api/categories` - Get all categories with counts
- `GET /api/categories/:id/shapes` - Get shapes by category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Upload
- `POST /api/upload` - Upload SVG file(s)
- `POST /api/upload/validate` - Validate SVG before upload

### Utilities
- `POST /api/backup` - Create database backup
- `POST /api/restore` - Restore from backup
- `GET /api/stats` - Get statistics

---

## Features to Implement

### Phase 1: Foundation (Current Task)
- [x] Project structure setup
- [ ] SQLite database setup
- [ ] Initial schema creation
- [ ] Backend server setup
- [ ] Basic CRUD operations

### Phase 2: Data Migration
- [ ] Migrate existing 80 SVGs to database
- [ ] Create file storage structure
- [ ] Seed categories
- [ ] Verify data integrity

### Phase 3: Upload & Management
- [ ] SVG upload endpoint
- [ ] SVG validation & sanitization
- [ ] Multi-file upload support
- [ ] Drag-and-drop UI
- [ ] Custom category creation

### Phase 4: Enhanced Features
- [ ] Search functionality
- [ ] Tag-based filtering
- [ ] Shape editing (rename, recategorize)
- [ ] Shape deletion with confirmation
- [ ] Bulk operations
- [ ] Favorites/recent shapes

### Phase 5: Production Polish
- [ ] Error handling
- [ ] Logging system
- [ ] Database backup automation
- [ ] Performance optimization
- [ ] Input validation
- [ ] Security measures

### Phase 6: Advanced Features
- [ ] Shape versioning
- [ ] Export functionality
- [ ] Import from external sources
- [ ] Custom color theming for shapes
- [ ] Usage statistics
- [ ] Shape collections/sets

---

## Security Considerations

1. **SVG Sanitization**: Remove scripts, external references
2. **File Size Limits**: Max 500KB per SVG
3. **File Type Validation**: Strict SVG-only uploads
4. **SQL Injection Prevention**: Parameterized queries
5. **Path Traversal Prevention**: Validate file paths
6. **CORS**: Localhost-only access
7. **Rate Limiting**: Prevent abuse

---

## Configuration

### Environment Variables (.env)
```
NODE_ENV=production
PORT=3456
DB_PATH=./storage/database/svg_studio.db
STORAGE_PATH=./storage/assets
MAX_FILE_SIZE=524288
ALLOWED_ORIGINS=http://localhost:*
LOG_LEVEL=info
BACKUP_ENABLED=true
BACKUP_INTERVAL=daily
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install express sqlite3 better-sqlite3 multer cors dotenv helmet express-validator morgan
npm install --save-dev nodemon jest supertest
```

### 2. Initialize Database
```bash
node scripts/init-db.js
```

### 3. Migrate Existing Data
```bash
node scripts/migrate-data.js
```

### 4. Start Backend Server
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

### 5. Test Plugin in Figma
- Backend running on http://localhost:3456
- Plugin connects to backend
- Load shapes from database

---

## Development Workflow

1. Backend server runs continuously in background
2. Plugin UI fetches shapes from backend on load
3. User can upload new SVGs via UI
4. Backend validates, sanitizes, stores SVG
5. Database updated with metadata
6. UI refreshes to show new shape
7. All changes persist across sessions

---

## Performance Optimization

1. **Caching**: In-memory cache for frequently accessed shapes
2. **Lazy Loading**: Load shapes on-demand by category
3. **Thumbnails**: Pre-generate thumbnails for faster preview
4. **Indexing**: Database indexes on search fields
5. **Compression**: Gzip SVG content in database
6. **Connection Pooling**: Reuse database connections

---

## Backup Strategy

1. **Automatic**: Daily database backups
2. **Manual**: On-demand backup via UI
3. **Retention**: Keep last 7 backups
4. **Export**: Export all data as JSON
5. **Import**: Restore from backup file

---

## Error Handling

1. **Validation Errors**: Clear user feedback
2. **Database Errors**: Logged + graceful fallback
3. **File System Errors**: Retry mechanism
4. **Network Errors**: Offline mode fallback
5. **Corrupt SVG**: Reject with explanation

---

## Testing Strategy

1. **Unit Tests**: Database queries, validators
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Full workflow testing
4. **Performance Tests**: Load testing
5. **Security Tests**: Injection attempts

---

## Future Enhancements

1. **Cloud Sync**: Optional cloud backup
2. **Collaboration**: Share shapes with team
3. **Version Control**: Git-like versioning
4. **AI Features**: Auto-categorization, similar shapes
5. **Analytics**: Most used shapes, trends
6. **Plugins**: Extend functionality
7. **Themes**: Light/dark mode
8. **Accessibility**: ARIA labels, keyboard shortcuts

---

## Success Metrics

- ✅ All 80 existing shapes migrated successfully
- ✅ Backend serves responses < 100ms
- ✅ Upload validates and stores SVG < 1s
- ✅ Zero data loss
- ✅ 100% uptime during development
- ✅ Comprehensive error handling
- ✅ Clean, maintainable code structure

---

## Next Steps

1. Review and approve this plan
2. Set up project dependencies
3. Create database schema
4. Build backend API
5. Update plugin UI to connect to backend
6. Test thoroughly
7. Deploy for local use
