// deno-lint-ignore-file no-explicit-any
import { EventEmitter, Redis, RedisOptions } from '../deps.ts';
import initializeRedlock from './global.redlock.ts';

export default class RedisClient {
	private options: RedisOptions;

	private isClientConnected = false;
	private isPublisherConnected = false;
	private isSubscriberConnected = false;
	private isRedLockConnected = false;
	private isBullConnected = false;

	private isResolved = false;
	private isRejected = false;

	public client!: InstanceType<typeof Redis> & { on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter };
	public publisher!: InstanceType<typeof Redis> & { on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter };
	public subscriber!: InstanceType<typeof Redis> & { on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter };
	public redLock!: InstanceType<typeof Redis> & { on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter };
	public bull!: InstanceType<typeof Redis> & { on(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter };

	public json = {
		/**
		 * @ref:  https://redis.io/commands/set
		 */
		set: async (key: string, path: string, value: any, options?: { mode?: 'NX' | 'XX'; EX?: number }): Promise<'OK' | null> => {
			try {
				// - JSON.SET key path value [NX | XX]

				if (typeof options?.EX === 'number' && !isNaN(options.EX)) {
					// prettier-ignore
					const txnRes = options?.mode
						? await this.client
							.multi()
							.call('JSON.SET', key, path, h.stringify(value), options.mode)
							.expire(key, options.EX)
							.exec()
						: await this.client
							.multi()
							.call('JSON.SET', key, path, h.stringify(value))
							.expire(key, options.EX)
							.exec(); // [ [err, res], [ err, res], .. ]

					if (!txnRes || txnRes[0][0] || txnRes[1][0]) return null;
					const jsonRes = txnRes[0][1];
					const expireRes = txnRes[1][1]; // 1 if the timeout was set. 0 if the timeout was not set.
					if (jsonRes && !expireRes) log.warning(`[Redis] failed to set expiry wit [JSON.SET] ${key} ${path} ${value} ${options?.EX} ${expireRes}`);
					return jsonRes as 'OK' | null;
				}

				const res = options?.mode
					? await this.client.call('JSON.SET', key, path, h.stringify(value), options.mode)
					: await this.client.call('JSON.SET', key, path, h.stringify(value));
				if (res === null) return res;
				return res as 'OK' | null;
			} catch (err: any) {
				log.error(`[Redis] failed to set ${key} ${path} ${value} ${options?.EX} ${err.message}`);
				return null;
			}
		},

		/**
		 * @ref:  https://redis.io/commands/get
		 */
		get: async <T>(key: string, path?: string): Promise<Partial<T> | null> => {
			// - JSON.GET key path
			const res = await this.client.call('JSON.GET', key, path ?? '$');
			if (res === null) return null;
			const parsedRes = h.parse(res);
			return Array.isArray(parsedRes) ? parsedRes[0] : parsedRes;
		},
	};

	constructor() {
		this.options = {
			host: Deno.env.get('REDIS_HOST'),
			port: parseInt(Deno.env.get('REDIS_PORT') ?? '', 10),
			// username: process.env.REDIS_USERNAME,
			password: Deno.env.get('REDIS_PASSWORD'),
			enableAutoPipelining: true,
			commandQueue: true,
			enableOfflineQueue: true,
			enableReadyCheck: true,
			reconnectOnError: () => true,
			maxRetriesPerRequest: null,
		};
	}

	private updateConnection(client?: 'GAME' | 'PUBLISHER' | 'SUBSCRIBER' | 'REDLOCK' | 'BULL', resolve = (_x: unknown) => {}) {
		if (client === 'GAME') this.isClientConnected = true;
		else if (client === 'PUBLISHER') this.isPublisherConnected = true;
		else if (client === 'SUBSCRIBER') this.isSubscriberConnected = true;
		else if (client === 'REDLOCK') this.isRedLockConnected = true;
		else if (client === 'BULL') this.isBullConnected = true;

		log.debug(`Redis client Connected '${client} '⚡`);

		if (this.isClientConnected && this.isPublisherConnected && this.isSubscriberConnected && this.isRedLockConnected && this.isBullConnected && !this.isResolved) {
			this.isResolved = true;
			log.debug(`IoRedis Initialized ✅`);
			resolve(null);
			initializeRedlock();
		}
	}

	private errorHandler(err: any, client?: 'GAME' | 'PUBLISHER' | 'SUBSCRIBER' | 'REDLOCK' | 'BULL', rej = (_x: unknown) => {}) {
		log.error(`Redis Error on client '${client}' ☠ \n ${err.message}`);
		if (this.isRejected) return;
		this.isRejected = true;
		rej(null);
	}

	private async setupConfig() {
		try {
			await this.subscriber.subscribe('__keyevent@0__:expired', 'redisEvent', () => (<EventEmitter> <unknown> this.subscriber).on('message', this.onMessage));
			if (Deno.env.get('DENO_ENV') !== 'prod') await this.client.config('SET', 'notify-keyspace-events', 'Ex');
		} catch (err: any) {
			log.error('RedisClient error on method setupConfig() ☠', +' ' + err?.message);
		}
	}

	private async onMessage(channel: string, message: any) {
		log.debug(`IORedisClient onMessage() message: ${message} channel: ${channel}`);
		let _channel, _message;

		if (channel === '__keyevent@0__:expired') {
			const [type] = message.split(':'); // 'sch:fqr6dlI_2Gg2TcH3_YTfj:assignBot::127.0.0.1' | redisEvent:uid1:cleanKick:kingdomId:kid_1:127.0.0.1'
			let channelId, taskName, userId, ip, customIdType, customId, key, val;
			switch (type) {
				// game schedular
				case 'sch':
					[, channelId, taskName, userId, ip] = message.split(':'); // 'sch:fqr6dlI_2Gg2TcH3_YTfj:assignBot::127.0.0.1'
					_channel = type; // 'sch'
					_message = { taskName, channelId, userId };
					break;
				// custom schedular
				case 'schCustom':
					[, userId, taskName, customIdType, customId, ip] = message.split(':'); // 'schCustom:uid1:cleanKick:kingdomId:kid_1:127.0.0.1'
					_channel = type; // 'schCustom'                                           'schCustom:uid_1:removeKickedKingdomData:kingdom_id:kid_1:127.0.0.1/dev'
					_message = { taskName, userId, customIdType, customId };
					break;
				case 'changeSeason':
					[, key, val, ip] = message.split(':');
					_channel = type;
					_message = { key, val };
					break;
				default:
					return false;
			}
			if (ip !== Deno.env.get('HOST')) return false;
		} else return;

		let parsedMessage = {};
		try {
			parsedMessage = h.parse(_message);
		} catch (err: any) {
			log.error(`can not parse message  ☠ -> ${_message} ${{ reason: err.message, stack: err.stack }}`);
			parsedMessage = _message;
		}
		await emitter.asyncEmit(_channel, parsedMessage); // ch : redisEvent | sch
	}

	public initialize() {
		return new Promise((res, rej) => {
			try {
				this.client = new Redis(this.options) as typeof this.client;
				this.publisher = new Redis(this.options) as typeof this.publisher;
				this.subscriber = new Redis(this.options) as typeof this.subscriber;
				this.redLock = new Redis(this.options) as typeof this.redLock;
				this.bull = new Redis(this.options) as typeof this.bull;

				this.client.on('error', (error) => this.errorHandler(error, 'GAME', rej));
				this.publisher.on('error', (error) => this.errorHandler(error, 'PUBLISHER', rej));
				this.subscriber.on('error', (error) => this.errorHandler(error, 'SUBSCRIBER', rej));
				this.redLock.on('error', (error) => this.errorHandler(error, 'REDLOCK', rej));
				this.bull.on('error', (error) => this.errorHandler(error, 'BULL', rej));
				this.setupConfig();

				/*
                this.client.on('connect', () => log.silly(`Redis connected 'GAME' ⚡`));
                this.publisher.on('connect', () => log.silly(`Redis connected 'PUBLISHER' ⚡`));
                this.subscriber.on('connect', () => log.silly(`Redis connected 'SUBSCRIBER' ⚡`));
                this.redLock.on('connect', () => log.silly(`Redis connected 'REDLOCK' ⚡`));
                this.bull.on('connect', () => log.silly(`Redis connected 'BULL' ⚡`));
                */

				this.client.on('ready', () => this.updateConnection('GAME', res));
				this.publisher.on('ready', () => this.updateConnection('PUBLISHER', res));
				this.subscriber.on('ready', () => this.updateConnection('SUBSCRIBER', res));
				this.redLock.on('ready', () => this.updateConnection('REDLOCK', res));
				this.bull.on('ready', () => this.updateConnection('BULL', res));
			} catch (err: any) {
				log.error(` Redis Error on initialize() ☠ ${err.message}`);
			}
		});
	}
}
