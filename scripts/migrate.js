import { Database } from 'bun:sqlite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const db = new Database('./payme.db')

// Read the latest migration file
const migrationFile = resolve('./drizzle/0004_dark_leo.sql')
const migration = readFileSync(migrationFile, 'utf-8')

console.log('Applying migration: 0004_dark_leo.sql')
console.log('SQL:', migration)

try {
  // Execute the migration
  db.exec(migration)
  console.log('✓ Migration applied successfully!')
} catch (error) {
  console.error('✗ Migration failed:', error.message)
  process.exit(1)
} finally {
  db.close()
}
