const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, '../storage/database/svg_studio.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✓ Created database directory');
}

// Initialize database
console.log('Initializing SVG Studio database...\n');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
console.log('Creating tables...');

// Categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ Created categories table');

// Shapes table
db.exec(`
  CREATE TABLE IF NOT EXISTS shapes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    svg_content TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    tags TEXT,
    is_custom BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )
`);
console.log('✓ Created shapes table');

// Shape history table
db.exec(`
  CREATE TABLE IF NOT EXISTS shape_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shape_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    user_note TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shape_id) REFERENCES shapes(id) ON DELETE CASCADE
  )
`);
console.log('✓ Created shape_history table');

// Settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ Created settings table');

// Create indexes
console.log('\nCreating indexes...');

db.exec('CREATE INDEX IF NOT EXISTS idx_shapes_category ON shapes(category_id)');
console.log('✓ Created index on shapes.category_id');

db.exec('CREATE INDEX IF NOT EXISTS idx_shapes_name ON shapes(name)');
console.log('✓ Created index on shapes.name');

db.exec('CREATE INDEX IF NOT EXISTS idx_shapes_custom ON shapes(is_custom)');
console.log('✓ Created index on shapes.is_custom');

db.exec('CREATE INDEX IF NOT EXISTS idx_history_shape ON shape_history(shape_id)');
console.log('✓ Created index on shape_history.shape_id');

// Insert default categories
console.log('\nInserting default categories...');

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, display_name, description, sort_order)
  VALUES (?, ?, ?, ?)
`);

const categories = [
  ['all', 'All', 'All available shapes', 0],
  ['waves', 'Waves', 'Wave patterns and backgrounds', 1],
  ['blobs', 'Blobs', 'Organic blob shapes', 2],
  ['shapes', 'Shapes', 'Geometric and UI shapes', 3],
  ['dividers', 'Dividers', 'Line dividers and separators', 4],
  ['frames', 'Frames', 'Border frames', 5],
  ['borders', 'Borders', 'Border styles', 6],
  ['custom', 'Custom', 'User uploaded shapes', 7]
];

const insertMany = db.transaction((cats) => {
  for (const cat of cats) {
    insertCategory.run(...cat);
  }
});

insertMany(categories);
console.log(`✓ Inserted ${categories.length} default categories`);

// Insert default settings
console.log('\nInserting default settings...');

const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value, description)
  VALUES (?, ?, ?)
`);

const settings = [
  ['version', '1.0.0', 'Database schema version'],
  ['max_svg_size', '524288', 'Maximum SVG file size in bytes (512KB)'],
  ['backup_enabled', 'true', 'Enable automatic backups'],
  ['last_backup', '', 'Timestamp of last backup']
];

const insertSettings = db.transaction((sets) => {
  for (const set of sets) {
    insertSetting.run(...set);
  }
});

insertSettings(settings);
console.log(`✓ Inserted ${settings.length} default settings`);

// Verify tables
console.log('\nVerifying database structure...');

const tables = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type='table'
  ORDER BY name
`).all();

console.log(`✓ Found ${tables.length} tables:`);
tables.forEach(t => console.log(`  - ${t.name}`));

// Get database stats
const stats = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM shapes) as shapes,
    (SELECT COUNT(*) FROM shape_history) as history,
    (SELECT COUNT(*) FROM settings) as settings
`).get();

console.log('\nDatabase Statistics:');
console.log(`  Categories: ${stats.categories}`);
console.log(`  Shapes: ${stats.shapes}`);
console.log(`  History: ${stats.history}`);
console.log(`  Settings: ${stats.settings}`);

db.close();

console.log('\n✅ Database initialized successfully!');
console.log(`📁 Database location: ${dbPath}`);
console.log('\nNext steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: node scripts/migrate-data.js');
console.log('  3. Run: npm run dev');
