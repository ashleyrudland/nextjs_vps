console.log(`${new Date().toISOString()}: /up route.ts loaded`);

export async function GET() {
	console.log(`${new Date().toISOString()}: /up GET hit`);
	return new Response('Ok', { status: 200 });
}
