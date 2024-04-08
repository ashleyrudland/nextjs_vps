import os from 'os';

import { takeRight } from 'lodash';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const totalMemory = os.totalmem();

type Telemetry = {
	memoryUsage: number;
	cpuUsage: number;
	when: Date;
};

let telemetry: Telemetry[] = [];

export async function GET(request: NextRequest) {
	cookies().get('auth');

	const cpus = os.cpus();
	const cpuUsageAmounts = cpus.map(cpu => {
		const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
		const usage = ((total - cpu.times.idle) / total) * 100;
		return usage;
	});
	const cpuUsage = Math.round(
		cpuUsageAmounts.reduce((acc, usage) => acc + usage, 0) / cpus.length,
	);

	const freeMemory = os.freemem();
	const memoryUsage = Math.round(
		((totalMemory - freeMemory) / totalMemory) * 100,
	);

	telemetry.push({
		memoryUsage,
		cpuUsage,
		when: new Date(),
	});

	telemetry.sort((a, b) => a.when.getTime() - b.when.getTime());

	if (telemetry.length > 100) {
		telemetry = takeRight(telemetry, 100);
	}

	console.log({
		...telemetry[telemetry.length - 1],
	});

	return Response.json({
		when: new Date().toISOString(),
		telemetry,
	});
}
