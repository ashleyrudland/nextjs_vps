'use client';

import { useCallback, useState, useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { TestCard } from '@/components/ui/test-card';

import { dbTest } from '@/app/actions/db-test';

const DbTest = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);
	const [result, setResult] = useState<Awaited<
		ReturnType<typeof dbTest>
	> | null>();
	const [startTime, setStartTime] = useState(0);
	const [runningTime, setRunningTime] = useState(0);

	const runTest = useCallback(async () => {
		setRunningTime(0);
		setStartTime(Date.now());
		setLoading(true);
		setError(null);
		setResult(null);
		dbTest()
			.then(res => {
				setResult(res);
				setError(res.error);
				setLoading(false);
			})
			.catch(error => {
				console.error(error);
				setError(error);
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		let timeout: NodeJS.Timeout | null = null;

		const cleanup = () => {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
		};

		if (startTime && loading) {
			timeout = setInterval(() => {
				if (!loading) cleanup();
				if (startTime) {
					setRunningTime(Date.now() - startTime);
				}
			}, 200);
		}

		return cleanup;
	}, [startTime, loading]);

	useEffect(() => {
		// @ts-expect-error run test in browser
		if (typeof window !== 'undefined' && !window.runDbTest) {
			// @ts-expect-error run test in browser
			window.runDbTest = true;
			setTimeout(() => runTest(), 1000);
		}
	}, [runTest]);

	return (
		<TestCard
			name="SQLite Writes/sec"
			content={
				<>
					{loading && (
						<div className="flex flex-row gap-1 items-center">
							<Spinner />
							<span>
								Running test ({(runningTime / 1000).toFixed(1)}
								s)...
							</span>
						</div>
					)}
					{!loading && result && (
						<ul>
							<li>
								Table size: {result.total.toLocaleString()}{' '}
								records
							</li>
							<li>
								Reads/sec:{' '}
								{result.readsPerSecond.toLocaleString()}
							</li>
							<li>
								Writes/sec:{' '}
								{result.writesPerSecond.toLocaleString()}
							</li>
							{result.failureRate > 0 && (
								<li>Failure rate: {result.failureRate}%</li>
							)}
						</ul>
					)}
					{error && (
						<>
							{typeof error === 'string' && error}
							{typeof error !== 'string' && JSON.stringify(error)}
						</>
					)}
				</>
			}
		/>
	);
};

export default DbTest;
