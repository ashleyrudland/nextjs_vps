import { sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';

import { comments } from '@/models/schema';
import { db } from '@/utils/db';

const insertQuery = db
	.insert(comments)
	.values({
		author: sql.placeholder('author'),
		content: sql.placeholder('content'),
	})
	.prepare();

export async function POST(request: NextRequest) {
	const runTest = request.nextUrl.searchParams.get('test') === 'y';

	if (runTest) {
		const { lastInsertRowid } = await insertQuery.execute({
			author: Math.random().toString(36).substring(7),
			content: Math.random().toString(36).substring(7),
		});

		return new Response(lastInsertRowid.toString(), { status: 200 });
	}

	return new Response('No test run', { status: 200 });
}
