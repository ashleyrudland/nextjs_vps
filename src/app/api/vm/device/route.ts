import os from 'os';
import { cookies } from 'next/headers';
import { exec } from 'child_process';

// Function to execute shell command
function executeCommand(command: string) {
	return new Promise<string>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(`exec error: ${error}`);
				return;
			}
			if (stderr) {
				reject(`stderr: ${stderr}`);
				return;
			}
			resolve(stdout.trim());
		});
	});
}

async function getTopProcesses() {
	const totalMemory = os.totalmem();
	const command = 'ps -axo comm,rss';
	const processList = await executeCommand(command);

	return processList
		.split('\n')
		.slice(1)
		.map(line => {
			const parts = line.trim().split(/\s+/);
			const rss = Number(parts[parts.length - 1]);
			const name = parts.slice(0, parts.length - 1).join(' ');
			const memoryPercentage = ((rss / totalMemory) * 100).toFixed(2);

			console.log({
				name,
				memoryPercentage,
			});
			return { name, memoryPercentage };
		})
		.sort((a, b) => Number(b.memoryPercentage) - Number(a.memoryPercentage))
		.slice(0, 5);
}

export async function GET() {
	// const processes = await getTopProcesses();

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
		// processes,
	});
}
