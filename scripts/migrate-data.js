const fs = require('fs');
const path = require('path');

// Read the ui.html file to extract ASSETS array
const uiPath = path.join(__dirname, '../ui.html');
const uiContent = fs.readFileSync(uiPath, 'utf8');

// Extract the ASSETS array using regex
const assetsMatch = uiContent.match(/var ASSETS = \[([\s\S]*?)\];/);

if (!assetsMatch) {
  console.error('❌ Could not find ASSETS array in ui.html');
  process.exit(1);
}

// Parse the JavaScript array by evaluating it safely
const assetsCode = `[${assetsMatch[1]}]`;
let ASSETS;

try {
  ASSETS = eval(assetsCode);
} catch (error) {
  console.error('❌ Error parsing ASSETS array:', error.message);
  process.exit(1);
}

console.log(`Found ${ASSETS.length} assets to migrate\n`);

// Now import database after we have the data
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../storage/database/svg_studio.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found. Please run: node scripts/init-db.js');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Get category lookup
const categories = db.prepare('SELECT id, name FROM categories').all();
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat.id;
});

console.log('Categories available:', Object.keys(categoryMap).join(', '));
console.log('');

// Prepare insert statement
const insertShape = db.prepare(`
  INSERT INTO shapes (name, category_id, svg_content, width, height, tags, is_custom)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertHistory = db.prepare(`
  INSERT INTO shape_history (shape_id, action, user_note)
  VALUES (?, ?, ?)
`);

// Helper function to extract dimensions
function extractDimensions(svg) {
  const widthMatch = svg.match(/width\s*=\s*["']?(\d+)["']?/i);
  const heightMatch = svg.match(/height\s*=\s*["']?(\d+)["']?/i);

  let width = widthMatch ? parseInt(widthMatch[1]) : null;
  let height = heightMatch ? parseInt(heightMatch[1]) : null;

  if (!width || !height) {
    const viewBoxMatch = svg.match(/viewBox\s*=\s*["']?[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']?/i);
    if (viewBoxMatch) {
      width = width || parseInt(viewBoxMatch[1]);
      height = height || parseInt(viewBoxMatch[2]);
    }
  }

  return { width, height };
}

// Migrate all assets in a transaction
const migrate = db.transaction(() => {
  let successCount = 0;
  let errorCount = 0;

  for (const asset of ASSETS) {
    try {
      const categoryId = categoryMap[asset.cat];

      if (!categoryId) {
        console.warn(`⚠️  Skipping ${asset.name}: category '${asset.cat}' not found`);
        errorCount++;
        continue;
      }

      const { width, height } = extractDimensions(asset.svg);

      // Determine tags based on category and name
      const tags = JSON.stringify([asset.cat, asset.id.charAt(0)]);

      // Insert shape
      const result = insertShape.run(
        asset.name,
        categoryId,
        asset.svg,
        width,
        height,
        tags,
        0 // not custom
      );

      // Log history
      insertHistory.run(
        result.lastInsertRowid,
        'created',
        'Migrated from ui.html ASSETS array'
      );

      successCount++;
      console.log(`✓ Migrated: ${asset.name} (${asset.cat}) [${width}x${height}]`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to migrate ${asset.name}:`, error.message);
    }
  }

  return { successCount, errorCount };
});

console.log('Starting migration...\n');

const result = migrate();

console.log('\n' + '='.repeat(60));
console.log('Migration Summary');
console.log('='.repeat(60));
console.log(`✅ Successfully migrated: ${result.successCount} shapes`);
if (result.errorCount > 0) {
  console.log(`❌ Failed: ${result.errorCount} shapes`);
}
console.log('');

// Verify migration
const stats = db.prepare(`
  SELECT
    c.name as category,
    c.display_name,
    COUNT(s.id) as count
  FROM categories c
  LEFT JOIN shapes s ON c.id = s.category_id
  GROUP BY c.id
  ORDER BY c.sort_order
`).all();

console.log('Database Statistics:');
console.log('-'.repeat(60));
stats.forEach(stat => {
  if (stat.count > 0) {
    console.log(`  ${stat.display_name.padEnd(20)} ${stat.count} shapes`);
  }
});

const totalShapes = db.prepare('SELECT COUNT(*) as count FROM shapes').get().count;
console.log('-'.repeat(60));
console.log(`  ${'Total'.padEnd(20)} ${totalShapes} shapes`);
console.log('');

db.close();

console.log('✅ Migration completed successfully!');
console.log('\nNext steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: npm run dev');
console.log('  3. Test API: curl http://localhost:3456/api/shapes');
