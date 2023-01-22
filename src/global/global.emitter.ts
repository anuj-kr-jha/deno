import { EventEmitter } from '../deps.ts';
// import type { Job } from 'bullmq';

class Emitter extends EventEmitter {
	// deno-lint-ignore no-explicit-any
	asyncEmit = (channel: string, data: any) => {
		return new Promise((resolve) => _emitter.emit(channel, data, resolve));
	};

	// /**
	//  * @param {string} jobName
	//  * @param {Job} job
	//  */
	// asyncBullEmit = (jobName: string, job: Job) => {
	// 	return new Promise((resolve) => _emitter.emit(jobName, job, resolve));
	// };
}
export const _emitter = new Emitter();
