import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../models/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(
	process.env.NODE_ENV === 'production' ? '/data/db.sqlite3' : './db.sqlite3',
);

// Set some performance parameters for SQLite
// found at: https://www.youtube.com/watch?v=B-_P0d1el2k
// copied from: https://github.com/rails/rails/blob/main/activerecord/lib/active_record/connection_adapters/sqlite3_adapter.rb
const sqlitePerfParams = {
	foreign_keys: true,
	journal_mode: 'WAL',
	synchronous: 'normal',
	mmap_size: 134217728, // 128 megabytes
	journal_size_limit: 67108864, // 64 megabytes
	cache_size: 2000,
};

for (const [key, value] of Object.entries(sqlitePerfParams)) {
	sqlite.pragma(`${key} = ${value}`);
}

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: './drizzle' });
