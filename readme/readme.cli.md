# Deno CLI

reference :=> [doc](https://deno.land/manual@v1.29.4/getting_started/command_line_interface)

## some useful commands

```bash
deno help bundle
deno bundle -h
deno bundle --help
```

## Watch mode

You can supply the --watch flag to deno run, deno test, deno bundle, and deno fmt to enable the built-in file watcher. The files that are watched depend on the subcommand used:

for deno run, deno test, and deno bundle the entrypoint, and all local files the entrypoint(s) statically import(s) will be watched.
for deno fmt all local files and directories specified as command line arguments (or the working directory if no specific files/directories is passed) are watched.
Whenever one of the watched files is changed on disk, the program will automatically be restarted / formatted / tested / bundled.

```bash
deno run --watch main.ts
deno test --watch
deno fmt --watch

#
deno run --allow-net --allow-write --allow-read --allow-env --watch ./src/main.ts
```

## Script arguments

Separately from the Deno runtime flags, you can pass user-space arguments to the script you are running by specifying them after the script name:

```bash
deno run main.ts a b -c --quiet
```

```typescript
// main.ts
console.log(Deno.args); // [ "a", "b", "-c", "--quiet" ]
```

_Note that anything passed after the script name will be passed as a script argument and not consumed as a Deno runtime flag. This leads to the following pitfall:_

### _Good. We grant net permission to net_client.ts_

```bash
deno run --allow-net net_client.ts
```

### _Bad! --allow-net was passed to Deno.args, throws a net permission error_

```bash
deno run net_client.ts --allow-net
```

Some see it as unconventional that:

- a non-positional flag is parsed differently depending on its position.

However:

- This is the most logical and ergonomic way of distinguishing between runtime flags and script arguments.
- This is, in fact, the same behavior as that of any other popular runtime.
- Try node -c index.js and node index.js -c. The first will only do a syntax check on index.js as per Node's -c flag. The second will execute index.js with -c passed to require("process").argv.
