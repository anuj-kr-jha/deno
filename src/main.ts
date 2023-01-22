import { serve } from './deps.ts';
import './global/global.ts';
await redis.initialize();

serve(async () => {
	const x = await redis.client.get('a');
	return new Response('pong: ' + x);
});
