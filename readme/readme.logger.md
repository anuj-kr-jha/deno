# Logger

## Levels

There are five standard logging levels (these are the most commonly used levels in industry)

```typescript
import * as log from 'https://deno.land/std@0.173.0/log/mod.ts';

enum LogLevels {
	NOTSET = 0,
	DEBUG = 10,
	INFO = 20,
	WARNING = 30,
	ERROR = 40,
	CRITICAL = 50,
}
```

## Logging Functions

Corresponding to levels, there are logging functions. For example: logger.debug function is used for logging at least at debug level.

_The logging functions are:_

> **debug**: Log if level is at least debug or higher
>
> **info**: Log if level is at least info or higher
>
> **warning**: Log if level is at least warning or higher
>
> **error**: Log if level is at least error or higher
>
> **critical**: Log if level is at least critical or higher

```typescript
logger.debug('abcd');
logger.info('abcd');
logger.warning('abcd');
logger.error('abcd');
logger.critical('abcd');
```

## Default settings

Unless customized, the logger comes with three default settings:

> Default log level is set to INFO
>
> Default logging destination is set to console
>
> Default logging format is: `DEFAULT_FORMATTER = "{levelName} {msg}"`

the default format is very simple: LEVEL MESSAGE. The default settings are good for development work, but not suitable for production work or background apps.

That’s where the custom settings come in.

_The custom settings can be applied in two steps_:

- custom handler
- custom formatter

Let’s see them one by one.

## Log Handlers

The logger has a concept of handlers. If unspecified, the default handler is set to console.

All the log handlers take the log level as input, to specify the minimum log level the handler would consider. Depending on the type of handler, there would be additional options like file name, max size, number of backups, etc.

Here is the complete list of handlers:

### ConsoleHandler

This handler writes log message to the console (also the default handler). In addition to log level, it can take a custom formatter.

```typescript
new ConsoleHandler(levelName, formatter);
```

### FileHandler

This handler writers log message to a fixed file. In additional to log level, it can take the output file name and a custom formatter.

```typescript
new FileHandler(levelName, { filename: '/var/tmp/a.log' });
```

### RotatingFileHandler

This writes log messages to a rotating set of files with a max size (in bytes) and max number of backups.

```typescript
new RotatingFileHandler(levelName, { filename: '/var/tmp/a.log', maxBytes: 10485760, maxBackupCount: 5 }); // mode?: 'a|w|x' // default: 'a'
```

#### mode

- `'a'` Default mode. As above, this will pick up where the logs left off in rotation, or create a new log file if it doesn't exist.
- `'w'` in addition to starting with a clean `filename`, this mode will also cause any existing backups (up to `maxBackupCount`) to be deleted on setup giving a fully clean slate.
- `'x'` requires that neither `filename`, nor any backups (up to `maxBackupCount`), exist before setup.

  > The log line boundaries would be preserved when rotating files.
  > In other words, if a log line is longer than maxBytes, it’d still be written in the same file.

  > **For development work, ConsoleHandler and FileHandler would be good. For production use, RotatingFileHandler would be the most useful as it’d keep the file size and number of backups in a limit. A normal FileHandler would grow the file as much as it could**.

### Formatter

#### A formatter could be a string or a function

#### _string_

This would contain the keys present in LogRecord to output in the desired format

```typescript
formatter:
'{datetime} {levelName} {msg}';
```

#### _function_

This is a callback function that would take a LogRecord as input and returns a string that would be logged directly. JSON logging can be done using a function formatter.

```typescript
formatter:
((rec) => JSON.stringify({ ts: rec.datetime, level: rec.levelName, data: rec.msg }));
```
