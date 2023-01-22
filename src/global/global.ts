// deno-lint-ignore-file no-var
import { load } from '../deps.ts';
// import type { Redlock } from '../deps.ts';
import Utils from './global.util.ts';
import { _emitter } from './global.emitter.ts';
import Logger from './global.logger.ts';
import IOREDIS from './global.ioredis.ts';

/* SETUP envs */
const envs = await load({ allowEmptyValues: false, envPath: '.env', export: true }); /* loading envs from '.env' files and export to `Deno.env` */
Logger.debug(envs, 'env_loaded', '', '');
//

declare global {
	var redis: IOREDIS;
	var h: typeof Utils;
	var log: typeof Logger;
	var emitter: typeof _emitter;
	// var Lock: InstanceType<typeof Redlock>;
}

globalThis.h = Utils;
globalThis.log = Logger;
globalThis.emitter = _emitter;
globalThis.redis = new IOREDIS();

export {};
