const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function isMigrationApplied(id) {
  const result = await db.query(
    'SELECT 1 FROM schema_migrations WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rowCount > 0;
}

async function markMigrationApplied(id) {
  await db.query(
    'INSERT INTO schema_migrations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
    [id]
  );
}

async function runSqlMigration({ id, fileName }) {
  if (await isMigrationApplied(id)) {
    console.log(`Миграция ${id} уже применена, пропуск`);
    return;
  }

  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
    await client.query('COMMIT');
    console.log(`Миграция ${id} успешно применена`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runStartupMigrations() {
  await ensureMigrationsTable();

  const migrations = [
    { id: '001-applications-foreign-residence', fileName: '001-applications-foreign-residence.sql' },
    { id: '002-draft-application-status', fileName: '002-draft-application-status.sql' }
  ];

  for (const migration of migrations) {
    await runSqlMigration(migration);
  }
}

module.exports = { runStartupMigrations };
