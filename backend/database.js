const Database = require('better-sqlite3');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// Ensure database directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(config.database.path, config.database.options);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Category queries
 */
const categoryQueries = {
  getAll: db.prepare(`
    SELECT
      c.*,
      COUNT(s.id) as shape_count
    FROM categories c
    LEFT JOIN shapes s ON c.id = s.category_id
    GROUP BY c.id
    ORDER BY c.sort_order
  `),

  getById: db.prepare('SELECT * FROM categories WHERE id = ?'),

  getByName: db.prepare('SELECT * FROM categories WHERE name = ?'),

  create: db.prepare(`
    INSERT INTO categories (name, display_name, description, sort_order)
    VALUES (?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE categories
    SET display_name = ?, description = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  delete: db.prepare('DELETE FROM categories WHERE id = ?')
};

/**
 * Shape queries
 */
const shapeQueries = {
  getAll: db.prepare(`
    SELECT
      s.*,
      c.name as category_name,
      c.display_name as category_display_name
    FROM shapes s
    JOIN categories c ON s.category_id = c.id
    ORDER BY s.created_at DESC
  `),

  getById: db.prepare(`
    SELECT
      s.*,
      c.name as category_name,
      c.display_name as category_display_name
    FROM shapes s
    JOIN categories c ON s.category_id = c.id
    WHERE s.id = ?
  `),

  getByCategory: db.prepare(`
    SELECT
      s.*,
      c.name as category_name,
      c.display_name as category_display_name
    FROM shapes s
    JOIN categories c ON s.category_id = c.id
    WHERE c.name = ?
    ORDER BY s.created_at DESC
  `),

  search: db.prepare(`
    SELECT
      s.*,
      c.name as category_name,
      c.display_name as category_display_name
    FROM shapes s
    JOIN categories c ON s.category_id = c.id
    WHERE s.name LIKE ? OR s.tags LIKE ?
    ORDER BY s.created_at DESC
  `),

  create: db.prepare(`
    INSERT INTO shapes (name, category_id, svg_content, width, height, tags, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE shapes
    SET name = ?, category_id = ?, svg_content = ?, width = ?, height = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  delete: db.prepare('DELETE FROM shapes WHERE id = ?'),

  count: db.prepare('SELECT COUNT(*) as count FROM shapes'),

  countByCategory: db.prepare(`
    SELECT COUNT(*) as count FROM shapes
    WHERE category_id = (SELECT id FROM categories WHERE name = ?)
  `)
};

/**
 * History queries
 */
const historyQueries = {
  create: db.prepare(`
    INSERT INTO shape_history (shape_id, action, user_note)
    VALUES (?, ?, ?)
  `),

  getByShape: db.prepare(`
    SELECT * FROM shape_history
    WHERE shape_id = ?
    ORDER BY timestamp DESC
  `),

  getRecent: db.prepare(`
    SELECT
      h.*,
      s.name as shape_name
    FROM shape_history h
    JOIN shapes s ON h.shape_id = s.id
    ORDER BY h.timestamp DESC
    LIMIT ?
  `)
};

/**
 * Settings queries
 */
const settingsQueries = {
  get: db.prepare('SELECT * FROM settings WHERE key = ?'),

  getAll: db.prepare('SELECT * FROM settings'),

  set: db.prepare(`
    INSERT INTO settings (key, value, description)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `),

  delete: db.prepare('DELETE FROM settings WHERE key = ?')
};

/**
 * Transaction helper
 */
function transaction(fn) {
  return db.transaction(fn);
}

/**
 * Export database instance and queries
 */
module.exports = {
  db,
  categoryQueries,
  shapeQueries,
  historyQueries,
  settingsQueries,
  transaction,

  // Utility function to close database
  close: () => db.close()
};
