import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
const schemaFile = isPostgres ? 'prisma/schema.prisma' : 'prisma/schema.sqlite.prisma';

console.log(`[DB Setup] Target Database: ${isPostgres ? 'PostgreSQL' : 'SQLite (Local)'}`);
console.log(`[DB Setup] Using Schema: ${schemaFile}`);

try {
  console.log('[DB Setup] Generating Prisma Client...');
  execSync(`npx prisma generate --schema=${schemaFile}`, { stdio: 'inherit' });

  console.log('[DB Setup] Pushing schema to database...');
  execSync(`npx prisma db push --schema=${schemaFile} --accept-data-loss`, { stdio: 'inherit' });

  console.log('[DB Setup] Seeding database with verified Indian foods & sample data...');
  execSync(`npx tsx prisma/seed.ts`, { stdio: 'inherit' });

  console.log('[DB Setup] Database setup completed successfully!');
} catch (error) {
  console.error('[DB Setup] Error setting up database:', error);
  process.exit(1);
}
