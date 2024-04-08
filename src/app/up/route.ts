// default uptime kamal check route, see: https://kamal-deploy.org/docs/configuration/healthchecks/

import os from 'os';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const startTime = new Date().toISOString();

export async function GET(request: NextRequest) {
	// make dynamic
	cookies().get('auth');

	return Response.json({
		startTime,
		now: new Date().toISOString(),
		url: request.nextUrl,
		uptime: os.uptime(),
	});
}
