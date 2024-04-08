// src/models/schema.ts
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const comments = sqliteTable('comments', {
	id: integer('id').primaryKey(),
	author: text('author').notNull(),
	content: text('content').notNull(),
});
