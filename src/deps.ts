/* -------------- deno standard module -------------- */
export { EventEmitter } from 'https://deno.land/std@0.173.0/node/events.ts';
export { serve } from 'https://deno.land/std@0.173.0/http/server.ts'; /* HTTP SERVER */
export { load } from 'https://deno.land/std@0.173.0/dotenv/mod.ts'; /* DOTENV */
export * as Logger from 'https://deno.land/std@0.173.0/log/mod.ts'; /* LOGGER */

/* ------------- deno third party module ------------- */

/* ----------------------- npm:CDN ----------------------- */
export { Redis } from 'https://esm.sh/ioredis@5.2.5'; /* IOREDIS */
export type { RedisOptions } from 'https://esm.sh/ioredis@5.2.5';
//
// import * as redlock from 'https://esm.sh/redlock@5.0.0-beta.2'; /* REDLOCK */
// export const Redlock = redlock.default;
// export const Redlock_ExecutionError = redlock.ExecutionError;
// export const Redlock_ResourceLockedError = redlock.ResourceLockedError;

/* ----------------------- npm ----------------------- */
// export { Redis } from 'npm:ioredis@5.2.5'; /* IOREDIS */
// export type { RedisOptions } from 'npm:ioredis@5.2.5';

//
// import * as redlock from 'npm:redlock@5.0.0-beta.2'; /* REDLOCK */
// export const Redlock = redlock.default;
// export const Redlock_ExecutionError = redlock.ExecutionError;
// export const Redlock_ResourceLockedError = redlock.ResourceLockedError;
//
