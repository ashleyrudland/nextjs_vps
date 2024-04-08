'use server';

import { eq } from 'drizzle-orm';
import chunk from 'lodash.chunk';
import { serializeError } from 'serialize-error';

import { comments } from '@/models/schema';
import { db } from '@/utils/db';
import { Comment } from '@/models/types';

export const throttleExec = async <T, R>(
	array: T[],
	asyncFn: (id: T) => Promise<R>,
	chunkSize = 100,
) => {
	const chunks = chunk(array, chunkSize);
	let i = 0;
	const len = chunks.length;
	let item = null;
	for (; i < len; i += 1) {
		item = chunks[i];
		await Promise.allSettled(item.map(asyncFn));
	}
};

export default async function dbTest() {
	let deleteTime = 0;
	let error = null;
	let failureRate = 0;
	let failures = 0;
	let writes = 0;
	let writesPerSecond = 0;
	let writeTime = 0;

	try {
		const values: Comment[] = Array.from(
			{ length: 5000 },
			() =>
				({
					author: Math.random().toString(36).substring(7),
					content: Math.random().toString(36).substring(7),
				}) as Comment,
		);

		let start = Date.now();
		const newRecords: number[] = [];
		await throttleExec(values, async ({ author, content }) => {
			try {
				const { lastInsertRowid } = await db.insert(comments).values({
					author,
					content,
				});
				newRecords.push(Number(lastInsertRowid));
				writes += 1;
			} catch (e) {
				failures += 1;
			}
		});
		writeTime = Date.now() - start;
		writesPerSecond = Math.round(writes / (writeTime / 1000));
		const deleteStart = Date.now();
		failureRate = Math.round((failures / writes) * 100);

		// delete records inserted to clean up
		await throttleExec(newRecords, newId =>
			db.delete(comments).where(eq(comments.id, newId)),
		);
		deleteTime = Date.now() - deleteStart;
	} catch (e: any) {
		console.error(e);
		error = {
			...{ message: e.message },
			...serializeError(e),
		};
	}

	return {
		error,
		deleteTime,
		failureRate,
		writes,
		writesPerSecond,
		writeTime,
	};
}
