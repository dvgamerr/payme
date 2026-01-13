/**
 * Database connection and migrations for PayMe
 * Using better-sqlite3 for synchronous SQLite operations
 */
import Database from 'better-sqlite3';
import { join } from 'path';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'payme.db');

// Create database connection
export const db = new Database(DB_PATH, {
  verbose: console.log,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Run all database migrations
 */
export function runMigrations() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      savings REAL NOT NULL DEFAULT 0,
      retirement_savings REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Fixed expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixed_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Budget categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      default_amount REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Months table
  db.exec(`
    CREATE TABLE IF NOT EXISTS months (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      is_closed INTEGER NOT NULL DEFAULT 0,
      closed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, year, month)
    )
  `);

  // Income entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS income_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
    )
  `);

  // Monthly budgets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      allocated_amount REAL NOT NULL,
      FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE,
      UNIQUE(month_id, category_id)
    )
  `);

  // Items (spending) table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      spent_on TEXT NOT NULL,
      FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
    )
  `);

  // Monthly snapshots (PDF) table
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id INTEGER NOT NULL UNIQUE,
      pdf_data BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
    )
  `);

  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sessions table (for cookie-based auth)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_months_user_year_month ON months(user_id, year, month);
    CREATE INDEX IF NOT EXISTS idx_income_month ON income_entries(month_id);
    CREATE INDEX IF NOT EXISTS idx_items_month ON items(month_id);
    CREATE INDEX IF NOT EXISTS idx_monthly_budgets_month ON monthly_budgets(month_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  `);

  console.log('✅ Database migrations completed');
}

// Initialize database on import
runMigrations();

export default db;
