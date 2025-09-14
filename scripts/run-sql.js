/*
 * Execute a SQL file against a Postgres connection URL.
 * Usage: node scripts/run-sql.js <path-to-sql> <postgres-url>
 */
const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const [file, url] = process.argv.slice(2);
  if (!file || !url) {
    console.error('Usage: node scripts/run-sql.js <sql-file> <postgres-url>');
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');

  async function run(connectionString, sslConfig) {
    const client = new Client({
      connectionString,
      ssl: sslConfig,
    });
    try {
      await client.connect();
      await client.query('begin');
      await client.query(sql);
      await client.query('commit');
      console.log('SQL executed successfully.');
      return true;
    } catch (e) {
      try { await client.query('rollback'); } catch {}
      console.error('SQL execution failed:', e && e.message ? e.message : e);
      return false;
    } finally {
      await client.end().catch(() => {});
    }
  }

  // Try with relaxed SSL first (rejectUnauthorized: false). If that fails, try without explicit ssl to let libpq parse sslmode
  const ok = await run(url, { rejectUnauthorized: false });
  if (!ok) {
    const ok2 = await run(url, true);
    if (!ok2) process.exit(2);
  }
}

main();


