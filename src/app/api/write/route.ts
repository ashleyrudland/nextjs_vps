import { comments } from '@/models/schema';
import { db } from '@/utils/db';
import { sql } from 'drizzle-orm';

const insertQuery = db
	.insert(comments)
	.values({
		author: sql.placeholder('author'),
		content: sql.placeholder('content'),
	})
	.prepare();

export async function POST() {
	const { lastInsertRowid } = await insertQuery.execute({
		author: Math.random().toString(36).substring(7),
		content: Math.random().toString(36).substring(7),
	});

	return new Response(lastInsertRowid.toString(), { status: 200 });
}
