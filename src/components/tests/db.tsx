'use client';

import { useCallback, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TestCard } from '@/components/ui/test-card';

import dbTest from '@/app/actions/db-test';

const DbTest = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);
	const [result, setResult] = useState<Awaited<
		ReturnType<typeof dbTest>
	> | null>();
	const [startTime, setStartTime] = useState(0);
	const [runningTime, setRunningTime] = useState(0);

	const runTest = useCallback(async (refresh = false) => {
		setRunningTime(0);
		setStartTime(Date.now());
		setLoading(true);
		setError(null);
		setResult(null);
		dbTest(refresh)
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
							<li className="font-bold text-foreground">
								Reads/sec:{' '}
								{result.readsPerSecond.toLocaleString()}
							</li>
							<li>Writes: {result.writes.toLocaleString()}</li>
							<li>
								Write time: {result.writeTime.toLocaleString()}
								ms
							</li>
							<li className="font-bold text-foreground">
								Writes/sec:{' '}
								{result.writesPerSecond.toLocaleString()}
							</li>
							<li>Failure rate: {result.failureRate}%</li>
							<li>
								Cleanup time:{' '}
								{result.deleteTime.toLocaleString()}ms
							</li>
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

			// viral tweet broke this on the baby VM
			// so we need to disable it for now
			// loading ? null : (
			// footer={	<Button onClick={() => runTest(true)}>
			// 		Run test again
			// 	</Button>}
			//
		/>
	);
};

export default DbTest;
