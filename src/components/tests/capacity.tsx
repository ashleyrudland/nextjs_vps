'use client';

import { useState, useEffect } from 'react';

import Chart from './chart';
import { TestCard } from '@/components/ui/test-card';
import { Spinner } from '@/components/ui/spinner';

function secondsToTime(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.round(seconds % 60);
	return `${hours}hr ${minutes}m ${remainingSeconds}s`;
}

const Capacity = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [uptime, setUptime] = useState(0);
	const [device, setDevice] = useState<{
		cpuCount: number;
		cpuModel: string;
		name: string;
		platform: string;
		totalMemory: number;
		processes?: { name: string; memoryPercentage: number }[];
	} | null>(null);
	const [usage, setUsage] = useState<
		{
			cpuUsage: number;
			memoryUsage: number;
			when: string;
		}[]
	>([]);

	useEffect(() => {
		// @ts-expect-error run test in browser
		if (typeof window === 'undefined' || window.runCapacityTest) return;
		// @ts-expect-error run test in browser
		window.runCapacityTest = true;
		setLoading(true);
		setError(null);

		let timeout: NodeJS.Timeout | null = null;

		fetch('/up')
			.then(res => res.json())
			.then(res => setUptime(res.uptime))
			.catch(() => setError('Failed to fetch uptime'));
		fetch('/api/vm/device')
			.then(res => res.json())
			.then(res => setDevice(res))
			.catch(() => setError('Failed to fetch device info'));

		const getUsage = () => {
			fetch('/api/vm/usage')
				.then(res => res.json())
				.then(res => {
					setUsage(res.telemetry);
					setLoading(false);
					timeout = setTimeout(getUsage, 5000);
				})
				.catch(() => setError('Failed to fetch device info'));
		};

		getUsage();
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, []);

	return (
		<TestCard
			name="VPS Capacity"
			content={
				<>
					{loading && (
						<div className="flex flex-row gap-1 items-center">
							<Spinner />
							<span>Getting info...</span>
						</div>
					)}
					{!loading && (
						<>
							<ul>
								{uptime && (
									<li>Uptime: {secondsToTime(uptime)}</li>
								)}
								{device && (
									<>
										<li>vCPUs: {device.cpuCount}</li>
										<li>CPU model: {device.cpuModel}</li>
										<li>Platform: {device.platform}</li>
										<li>
											Total RAM:{' '}
											{(
												device.totalMemory /
												1024 /
												1024 /
												1024
											).toFixed(1)}
											GB
										</li>

										{device.processes &&
											device.processes.length > 0 && (
												<>
													{device.processes.map(
														({
															name,
															memoryPercentage,
														}) => (
															<li>
																{name.length >
																10
																	? name.substring(
																			0,
																			10,
																		) +
																		'...'
																	: name}
																:{' '}
																{
																	memoryPercentage
																}
																%
															</li>
														),
													)}
												</>
											)}
									</>
								)}

								{usage && <Chart data={usage} />}
							</ul>
						</>
					)}
					{error && <p>{error}</p>}
				</>
			}
		/>
	);
};

export default Capacity;
