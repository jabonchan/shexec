<div align="center">
    <img src="./assets/logo.png" alt="Logo" width="250">
    <h3><i>Spawn made easy 🚀</i></h3><br />
    <img src="https://github.com/jabonchan/shexec/actions/workflows/deno.yml/badge.svg?branch=main"></img>
    <img src="https://img.shields.io/badge/Tested%20on%20Deno-2.5.3-blue"></img>
    <img src="https://img.shields.io/badge/Dependencies-2-yellow"></img>
    <hr /><br />
</div>

A simple Deno 🦖 library that makes spawning processes and managing them as easy and fast as it ever was 🚀.

> This library was inspired by [zx](https://github.com/google/zx), which was made by **Google**

<hr /><br />

## Why? 🤔

I've always felt Deno's way of dealing with child processes was awful, very awkward and not easy to use overall. So I thought: *"Why not make a library that allows you to spawn processes using command line syntax?"* and that's how **shexec** was born.

## Coding Style ✍️

<img align="right" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Deno_Logo_2024.svg/2048px-Deno_Logo_2024.svg.png" alt="Deno Logo" width="80" height="80" />

The **shexec** project follows Deno's official formatting standards. All source code is automatically formatted using the `deno fmt` command, with settings defined in the `deno.json` configuration file.

## Documentation 📚
## Importing 📥

You can import **shexec**'s multiple exports in your project like this:

```ts
import $ from "jsr:@jabonchan/shexec";

import type {
    ShexecSubstitution,
    ShexecExecInheritedOutput,
    ShexecExecPipedOutput
} from "jsr:@jabonchan/shexec";
```

## Examples 🤓

**Using echo in unix with a variable**
```ts
import $ from "jsr:@jabonchan/shexec";

const name = prompt("What's your name?") ?? "Someone";

await $.inherit`echo Hello ${name}`;

// stdin: John
// stdout: Hello John
```

**Obtaining IPv4 on Windows**
```ts
import $ from "jsr:@jabonchan/shexec";

const IPV4_PATTERN = /IPv4(?:\.|\s)+:(?:\s+)((?:\.|\d)+)/;
const { decoded } = await $`ipconfig`;

const ip = decoded.stdout.match(IPV4_PATTERN)?.[1] ?? "Offline";
console.log("Result: " + ip);

// stdout: Result: 192.X.X.X
// or
// stdout: Result: Offline
```

## Types 🗃️

### `ShexecSubstitution`
Represents the array of substitutions that are provided to template string functions. Inside this array we find the values that a substitution can have, which are a string, number or an array of both.
```ts
type ShexecSubstitution = Array<
    string | number | Array<string | number>
>;
```

### `ShexecExecInheritedOutput`
Represents the output of a inherited stdio shell execution.

`success` - Indicates whether the execution was successful.

`code` - The exit code of the process.

`signal` - The signal that caused the process to terminate, or `null` if none.
```ts
interface ShexecExecInheritedOutput {
    success: boolean;
    code: number;
    signal: Deno.Signal | null;
}
```

### `ShexecExecPipedOutput`

Represents the output of a piped stdio shell execution.

`decoded` - Contains the decoded output streams as strings.

`decoded.stdout` - The decoded standard output as a string. In UNIX systems `TextDecoder("utf-8")` is used. In Windows `iconv.decode(buf, "cp850")` is used since that's Windows' default terminal encoding.

`decoded.stderr` - The decoded standard error as a string. In UNIX systems `TextDecoder("utf-8")` is used. In Windows `iconv.decode(buf, "cp850")` is used since that's Windows' default terminal encoding.

`stdout` - The raw standard output as a Uint8Array.

`stderr` - The raw standard error as a Uint8Array.

`success` - Indicates whether the execution was successful.

`code` - The exit code of the process.

`signal` - The signal that caused the process to terminate, or `null` if none.
```ts
interface ShexecExecPipedOutput {
    decoded: {
        stdout: string;
        stderr: string;
    };
    stdout: Uint8Array<ArrayBuffer>;
    stderr: Uint8Array<ArrayBuffer>;
    success: boolean;
    code: number;
    signal: Deno.Signal | null;
}
```

## Methods ✨

### `$ (Default Export)`
This is a **template function** that internally creates a `Deno.ChildProcess` with stdio set to `piped` and with the executable and arguments passed to the function **as a template**. It then spawns the process and waits for it to finish, returning a ``Promise<ShexecExecPipedOutput>``.
```ts
async function $(template: TemplateStringsArray, ...substitutions: ShexecSubstitution): Promise<ShexecExecPipedOutput>
```

Can be used like this:
```ts
$`command argument1 "argument${2}" argument${"3"}`
```

The rules for the syntaxis are:
* Anything that's not separated by a whitespace is considered a single argument.

* Only `"` works for quoting, `'` doesn't.

* Supports all JavaScript escape sequences.

* Arrays are expanded onto multiple arguments, and, if empty, no argument is added.

* Any whitespace works, including breaklines, tabs, and so on, so multiline command is allowed **unless it's inside a quoted argument**

* Arrays **cannot** be combined with any other argument, that means it can't be put after an argument without a whitespace between or inside a quoted argument. Otherwise an error will be thrown.

* Numbers and strings are allowed as standalone arguments or to be combined with other arguments.

* If no command is passed (no first argument) then an error is thrown.

### All template functions in this module follow this syntax and usage.

### `$.inherit`
This function behaves exactly like `$` with the difference that stdio is set to `inherit` and therefore can't be used later. It returns a `Promise<ShexecExecInheritedOutput>`.
```ts
async function inherit(template: TemplateStringsArray, ...substitutions: ShexecSubstitution): Promise<ShexecExecInheritedOutput>
```

### `$.spawn`
This function behaves exactly like `$` but with some differences. Stdio is set to `piped` and the process is spawned inmediatly; **but it's not awaited** and instead returns a `Deno.ChildProcess`.
```ts
function spawn(template: TemplateStringsArray, ...substitutions: ShexecSubstitution): Deno.ChildProcess
```

### `$.spawnInherit`
This function behaves exactly like `$.spawn` but with the difference that stdio is set to `inherit` and therefore trying to access it's contents will throw an error.
```ts
function spawnInherit(template: TemplateStringsArray, ...substitutions: ShexecSubstitution): Deno.ChildProcess
```

### `$.parse`
This function parses the template tag that is passed to the other `$` functions and returns an object with the executable and arguments.
```ts
function parse(template: TemplateStringsArray, ...substitutions: ShexecSubstitution): { executable: string; arguments: string[] };
```

## Running Tests ⚙️

**shexec** uses Deno's built-in test feature. To run all the tests, use the following command:
```bash
deno test
```

You can also pass the `--filter` flag to run specific tests based on their name pattern:
```bash
deno test --filter match-pattern
```

To see the available test names, you can check the source code. Some of the test names include:
- `parsing`
- `spawning`

## Dependencies 🗃️

**shexec** uses Deno's [expect](https://jsr.io/@std/expect) from the [Deno Standard Library](https://jsr.io/@std) for testing, which is licensed under the MIT license. I do not own nor have any right over this dependency.

**shexec** uses pillarjs's [iconv-lite](https://www.npmjs.com/package/iconv-lite) for decoding, which is licensed under the MIT license. I do not own nor have any right over this dependency.

<br /><hr />

## LICENSE 🔒

**shexec** is licensed under the MIT License. By using this library, you agree to all the terms and conditions stated in the license.
