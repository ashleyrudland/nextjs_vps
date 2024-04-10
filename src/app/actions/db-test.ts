'use server';

import { stat } from 'fs/promises';
import { count, eq, sql } from 'drizzle-orm';
import chunk from 'lodash.chunk';
import { comments } from '@/models/schema';
import { DB_PATH, db } from '@/utils/db';
import { Comment } from '@/models/types';

import { createStaleWhileRevalidateCache } from 'stale-while-revalidate-cache';

/**
 * Executes an asynchronous function on chunks of an array concurrently.
 * @param array The array to be processed.
 * @param asyncFn The asynchronous function to be executed on each element of the array.
 * @param chunkSize The size of each chunk. Defaults to 50.
 * @returns A Promise that resolves when all chunks have been processed.
 */
export const throttleExec = async <T, R>(
	array: T[],
	asyncFn: (id: T) => Promise<R>,
	chunkSize = 50,
) => {
	const chunks = chunk(array, chunkSize);
	for (const item of chunks) {
		await Promise.allSettled(item.map(asyncFn));
	}
};

/**
 * Inserts multiple comments into the database.
 * @param values An array of Comment objects to be inserted.
 * @returns An object containing the IDs of the new records, the number of writes, and the number of failures.
 */
async function insertComments(values: Comment[]) {
	const newRecords: number[] = [];
	let writes = 0;
	let failures = 0;

	const insertQuery = db
		.insert(comments)
		.values({
			author: sql.placeholder('author'),
			content: sql.placeholder('content'),
		})
		.prepare();

	await throttleExec(values, async ({ author, content }) => {
		try {
			const { lastInsertRowid } = await insertQuery.execute({
				author,
				content,
			});
			newRecords.push(Number(lastInsertRowid));
			writes++;
		} catch {
			failures++;
		}
	});

	return { newRecords, writes, failures };
}

/**
 * Measures the read performance by querying inserted records.
 * @param newRecords An array of IDs for the newly inserted records.
 * @returns An object containing the number of reads and the reads per second.
 */
async function measureReads(newRecords: number[]) {
	const readStart = Date.now();

	const query = db.query.comments
		.findFirst({ where: eq(comments.id, sql.placeholder('id')) })
		.prepare();

	let reads = 0;
	await throttleExec(newRecords, async newId => {
		await query.execute({ id: newId });
		reads++;
	});

	const readTime = Date.now() - readStart;
	const readsPerSecond = Math.round(reads / (readTime / 1000));

	return { reads, readsPerSecond };
}

type TestResult = {
	dbSizeInMb: number;
	error?: string;
	failureRate: number;
	reads: number;
	readsPerSecond: number;
	total: number;
	writes: number;
	writesPerSecond: number;
	writeTime: number;
};

/**
 * Performs a database test by inserting, reading, and deleting comments.
 * @returns The test results including write and read performance metrics.
 */
async function runTests(): Promise<TestResult | undefined> {
	const values = Array.from({ length: 100000 }, () => ({
		author: Math.random().toString(36).substring(7),
		content: Math.random().toString(36).substring(7),
	})) as Comment[];

	try {
		const start = Date.now();
		const { newRecords, writes, failures } = await insertComments(values);
		const writeTime = Date.now() - start;
		const writesPerSecond = Math.round(writes / (writeTime / 1000));
		const failureRate = Math.round((failures / writes) * 100);

		const { reads, readsPerSecond } = await measureReads(newRecords);

		const [{ count: total }] = await db
			.select({ count: count() })
			.from(comments)
			.execute();

		const dbSizeInMb = (await stat(DB_PATH)).size / 1024 / 1024;

		return {
			dbSizeInMb,
			failureRate,
			reads,
			readsPerSecond,
			total,
			writes,
			writesPerSecond,
			writeTime,
		};
	} catch (e: any) {
		console.log(e);
		return undefined;
	}
}

const map = new Map<string, unknown>();
const swr = createStaleWhileRevalidateCache({
	storage: {
		getItem: (key: string) => {
			return map.get(key);
		},
		setItem: async (key: string, value: unknown) => {
			map.set(key, value);
		},
	},
});

/**
 * Executes database tests using a caching mechanism to avoid frequent re-execution.
 * It leverages the stale-while-revalidate strategy to manage cache freshness.
 * @returns The result of the database tests including performance metrics.
 * @throws Throws an error if the test fails to run or returns an undefined result.
 */
export async function dbTest(): Promise<TestResult> {
	const result = await swr('test', async () => await runTests(), {
		maxTimeToLive: 1000 * 60 * 2, // 2 minutes
		minTimeToStale: 1000 * 60 * 1, // 1 minute
	});

	if (result.value === undefined) {
		throw new Error('Failed to run tests');
	}

	return result.value;
}
