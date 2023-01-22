// deno-lint-ignore-file no-explicit-any
import type { EventEmitter } from '../deps.ts';
import { Redlock, Redlock_ResourceLockedError } from '../deps.ts';

function errorHandler(error: any) {
	// Ignore cases where a resource is explicitly marked as locked on a client.
	if (error instanceof Redlock_ResourceLockedError) return;
	// Log all other errors.
	log.error(`A error has occurred. [[redlock]] ☠. reason: ${error?.message}`);
}

function initializeRedlock() {
	try {
		const redlock = new Redlock([(<any> <unknown> redis).redLock], {
			driftFactor: 0.01, // multiplied by lock ttl to determine drift time
			retryCount: -1,
			retryDelay: 200, // time in ms
			retryJitter: 200, // time in ms
			automaticExtensionThreshold: 500, // time in ms
		});
		(<EventEmitter> <unknown> redlock).on('error', errorHandler);
		globalThis.Lock = redlock;
		log.debug('RedLock initialized 🔐');
	} catch (err: any) {
		log.critical(`RedLock initialization failed ❌ \nreason: ${err.message}`);
	}
}

export default initializeRedlock;
