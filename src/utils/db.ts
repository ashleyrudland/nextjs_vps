import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../models/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(
	process.env.NODE_ENV === 'production' ? '/data/db.sqlite3' : './db.sqlite3',
);

sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: './drizzle' });
