import { serve } from './deps.ts';
// import './global/global.ts';
// await redis.initialize();

import { connect } from 'https://deno.land/x/redis@v0.29.0/mod.ts';
const redis = await connect({
	hostname: 'redis-18015.c301.ap-south-1-1.ec2.cloud.redislabs.com',
	port: 18015,
	password: 'k39y54ZB6vf6ne4lMFrR3dW6vt58vBWD',
});

const ok = await redis.set('hoge', 'fuga');
const fuga = await redis.get('hoge');

serve(async () => {
	const x = await redis.get('a');
	return new Response('pong: ' + x);
});
