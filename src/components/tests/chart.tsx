'use client';

import moment from 'moment';
import {
	LineChart,
	Line,
	Tooltip,
	Legend,
	CartesianGrid,
	XAxis,
	YAxis,
} from 'recharts';

type Telemetry = {
	cpuUsage: number;
	memoryUsage: number;
	when: string;
};

export default function Chart({ data }: { data: Telemetry[] }) {
	return (
		<div className="py-6">
			<LineChart
				width={500}
				height={300}
				data={data}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 5,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis
					dataKey="when"
					tickFormatter={value =>
						moment(value as string).format('HH:mm:ss')
					}
				/>
				<YAxis tickFormatter={value => `${Math.round(value)}%`} />
				<Tooltip
					formatter={value => (value ? `${value as number}%` : '0%')}
				/>
				<Legend />
				<Line
					type="monotone"
					dataKey="cpuUsage"
					stroke="#8884d8"
					label="CPU Usage"
				/>
				<Line
					type="monotone"
					dataKey="memoryUsage"
					stroke="#82ca9d"
					label="Memory Usage"
				/>
			</LineChart>
		</div>
	);
}
