import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePassword = process.env.SUPABASE_DB_PASSWORD || 'Abdulsobur2007';

// Extract project ref from Supabase URL
const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not set or invalid.');
  console.error('Expected format: https://XXXXXX.supabase.co');
  process.exit(1);
}

// Try direct connection first, then pooler
const connections = [
  { name: 'direct (5432)', url: `postgresql://postgres:${encodeURIComponent(supabasePassword)}@db.${projectRef}.supabase.co:5432/postgres` },
  { name: 'pooler session (5432)', url: `postgresql://postgres:${encodeURIComponent(supabasePassword)}@${projectRef}.supabase.co:5432/postgres` },
  { name: 'pooler transaction (6543)', url: `postgresql://postgres:${encodeURIComponent(supabasePassword)}@${projectRef}.supabase.co:6543/postgres` },
];

async function main() {
  const sql = readFileSync(join(__dirname, 'supabase_schema.sql'), 'utf-8');

  for (const conn of connections) {
    console.log(`Trying ${conn.name}...`);
    const pool = new pg.Pool({
      connectionString: conn.url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    try {
      await pool.query(sql);
      console.log(`✅ Schema migration completed via ${conn.name}!`);
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.log(`  ❌ ${conn.name} failed: ${err.message.slice(0, 100)}`);
      await pool.end();
    }
  }

  console.log('\n❌ All connection methods failed.');
  console.log('\n👉 To apply the schema manually:');
  console.log('   1. Go to https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('   2. Copy the contents of scripts/supabase_schema.sql');
  console.log('   3. Paste into the SQL Editor and click "Run"');
  process.exit(1);
}

main();
