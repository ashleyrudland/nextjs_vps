import { cookies } from 'next/headers';
import os from 'os';

export async function GET() {
	cookies().get('auth');
	let start = Date.now();
	const platform = `${os.platform()}, ${os.arch()}, ${os.release()}`;
	console.log('platform took', Date.now() - start);

	start = Date.now();
	const totalMemory = os.totalmem();
	console.log('total mem took', Date.now() - start);

	start = Date.now();
	const cpuList = os.cpus();
	console.log('cpu list took', Date.now() - start);

	return Response.json({
		when: new Date().toISOString(),
		platform,
		totalMemory,
		cpuCount: cpuList.length,
		cpuModel: cpuList[0].model,
	});
}
