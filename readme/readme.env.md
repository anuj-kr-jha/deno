# Deno ENV

reference :=> [doc](https://deno.land/manual@v1.29.4/basics/env_variables)

## Environment variables

There are a few ways to use environment variables in Deno:

### [](https://deno.land/manual@v1.29.4/basics/env_variables#built-in-denoenv)Built-in `Deno.env`

The Deno runtime offers built-in support for environment variables with [`Deno.env`](https://deno.land/api@v1.25.3?s=Deno.env).

`Deno.env` has getter and setter methods. Here is example usage:

Deno.env.set("FIREBASE_API_KEY", "examplekey123");
Deno.env.set("FIREBASE_AUTH_DOMAIN", "firebasedomain.com");

console.log(Deno.env.get("FIREBASE_API_KEY")); // examplekey123
console.log(Deno.env.get("FIREBASE_AUTH_DOMAIN")); // firebasedomain.com

### [](https://deno.land/manual@v1.29.4/basics/env_variables#env-file) `.env` file

You can also put environment variables in a `.env` file and retrieve them using `dotenv` in the standard library.

Let's say you have an `.env` file that looks like this:

PASSWORD=Geheimnis

To access the environment variables in the `.env` file, import the config function from the standard library. Then, import the configuration using the `config` function.

import { config } from "https://deno.land/std/dotenv/mod.ts";

const configData = await config();
const password = configData["PASSWORD"];

console.log(password);
// "Geheimnis"

### [](https://deno.land/manual@v1.29.4/basics/env_variables#stdflags) `std/flags`

The Deno standard library has a [`std/flags` module](https://deno.land/std@0.173.0/flags/README.md?source=) for parsing command line arguments.

```typescript
import { load } from 'https://deno.land/std@0.173.0/dotenv/mod.ts'; /* DOTENV */
Deno.env.set('SOME_VAR', 'Value');
Deno.env.get('SOME_VAR'); // outputs "Value"
Deno.env.delete('SOME_VAR'); // outputs "undefined"
Deno.env.get('SOME_VAR'); // outputs "undefined"

const env = Deno.env.toObject(); // Record<string, string> // will contain all envs
```
