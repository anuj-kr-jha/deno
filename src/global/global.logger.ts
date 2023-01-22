// deno-lint-ignore-file no-explicit-any

import { Logger } from '../deps.ts';

const formatter = {
	default: '{datetime} {levelName} {msg}',
	custom: (rec: any) => {
		//
		// access args
		const args = rec.args;
		const id = args[args.length - 1] ?? '';
		const flag = args[args.length - 2] ?? '';
		const track = args[args.length - 3] ?? '';
		return `${rec.datetime} ${rec.levelName} id: ${id}, flag: ${flag}, track: ${track}, data: \n${rec.msg}\n`;
	},
	json: (rec: any) => JSON.stringify({ ts: rec.datetime, level: rec.levelName, data: rec.msg }),
	jsonWithRegion: (rec: any) => JSON.stringify({ region: rec.loggerName, ts: rec.datetime, level: rec.levelName, data: rec.msg }),
	jsonWithArgs: (rec: any) => {
		//
		// access args
		const args = rec.args;
		const id = args[args.length - 1] ?? '';
		const flag = args[args.length - 2] ?? '';
		const track = args[args.length - 3] ?? '';
		//
		return JSON.stringify({ ts: rec.datetime, level: rec.levelName, id, flag, track, data: rec.msg });
	},
	jsonWithArgsAndRegion: (rec: any) => {
		//
		// access args
		const args = rec.args;
		const id = args[args.length - 1] ?? '';
		const flag = args[args.length - 2] ?? '';
		const track = args[args.length - 3] ?? '';
		//
		return JSON.stringify({ region: rec.loggerName, ts: rec.datetime, level: rec.levelName, id, flag, track, data: rec.msg });
	},
};

const handlers = {
	console: new Logger.handlers.ConsoleHandler('DEBUG', { formatter: formatter.custom }),
	// file: (filename: string) => new Logger.handlers.FileHandler('INFO', { filename, formatter: formatter.jsonWithArgs, mode: 'a' }),
	// rotatingFile: (filename: string) =>
	// 	new Logger.handlers.RotatingFileHandler('INFO', { filename, maxBytes: (2 ** 10) * (2 ** 10), maxBackupCount: 5, formatter: formatter.jsonWithArgs, mode: 'a' }),
};

Logger.setup({
	/* define handlers */
	handlers: {
		console: handlers.console,
		// file: handlers.rotatingFile('./.logs/a.log'),
	},

	/**
	 * - assign handlers to loggers.
	 * - level should not be less than level specified in handler
	 * - level would not have any effect if level specified here is less than what specified in handler.
	 * -   in that case level of handler will be used
	 */
	loggers: {
		default: { level: 'DEBUG', handlers: ['console'] },
		// file: { level: 'INFO', handlers: ['file'] },
		consoleAndFile: { level: 'DEBUG', handlers: ['console', 'file'] },
	},
});

const lg = Logger.getLogger('default'); // Logger.getLogger('consoleAndFile');

export default lg;
// lg.debug({a: 1, b: {c: 1}}, 'track:status', 'flag:req_id', 'id:user_id');
