export type { ShexecSubstitution } from "./lib/parsing/parse-command-line.ts";

export type {
    ShexecExecInheritedOutput,
    ShexecExecPipedOutput,
} from "./lib/output-type.ts";

import type {
    ShexecExecInheritedOutput,
    ShexecExecPipedOutput,
} from "./lib/output-type.ts";

import type { ShexecSubstitution } from "./lib/parsing/parse-command-line.ts";
import { spawn, spawnInherit } from "./lib/spawn.ts";
import { exec, execInherit } from "./lib/exec.ts";
import { parseCommandLine } from "./lib/parsing/parse-command-line.ts";

interface ShexecExports {
    (
        template: TemplateStringsArray,
        ...substitutions: ShexecSubstitution
    ): Promise<ShexecExecPipedOutput>;

    /**
     * Parses a command line from a tagged template string and substitutions, splitting it into an executable and arguments.
     *
     * The core parser for shell command templates, supporting escape sequences,
     * quoted arguments, and array substitutions for argument lists. It processes the template string and interpolates
     * substitutions, returning the executable and its arguments as strings.
     *
     * **Limitations:**
     * - Only double quotes (`"`) are supported for quoting.
     * - Array substitutions must be standalone (not combined with other arguments).
     * - Throws if no executable is provided.
     * - Throws on invalid escape sequences.
     * - Quotes inside arguments aren't seen as separators.
     *
     * **Syntax**
     * - The first argument is treated as the executable.
     * - Arguments are separated by whitespace (spaces, tabs, newlines) unless inside quotes.
     * - Double quotes (`"`) can be used to include whitespace in an argument.
     * - Backslashes (`\`) are used for escape sequences (e.g., `\n`, `\t`, `\"`, `\\`).
     * - Substitutions can be strings, numbers, or arrays of strings/numbers.
     * - Arrays are expanded into multiple arguments.
     * - Substitutions written next to other non-whitespace characters are concatenated as one argument.
     *
     * @param template The template strings array from a tagged template literal.
     * @param substitutions The values to interpolate into the template, which may be strings, numbers, or arrays of strings/numbers.
     * @returns An object containing the parsed `executable` and `arguments` array.
     *
     * @throws {Error} If no executable is provided, or if an array substitution is combined with other arguments.
     * @throws {SyntaxError} If an invalid escape sequence is encountered.
     *
     * @example
     * ```ts
     * const { executable, arguments } = parse`echo "Hello, ${"world"}!"`;
     * // executable: "echo"
     * // arguments: ["Hello, world!"]
     * ```
     */
    parse: (
        template: TemplateStringsArray,
        ...substitutions: ShexecSubstitution
    ) => { executable: string; arguments: string[] };

    /**
     * Executes a command using a template string for syntax. For more reference
     * regarding the template string syntax, see {@link ShexecSubstitution}.
     *
     * The spawned process uses ``Deno.ChildProcess``'s ``output()`` method to
     * capture the output, meaning once this returns the process has already
     * completed.
     *
     * The stdio of the process is set to "inherit".
     *
     * @example
     * ```ts
     * import $ from "shexec";
     *
     * const output = await $`echo Hello, ${"world"}!`;
     *
     * // LOG: Hello, world!
     * ```
     */
    inherit: (
        template: TemplateStringsArray,
        ...substitutions: ShexecSubstitution
    ) => Promise<ShexecExecInheritedOutput>;

    /**
     * Executes a command using a template string for syntax. For more reference
     * regarding the template string syntax, see {@link ShexecSubstitution}.
     *
     * The spawned process uses ``Deno.ChildProcess``' to create the
     * sub process and returns it without any modificatio nor procedure.
     *
     * The stdio of the process is set to "piped".
     *
     * @example
     * ```ts
     * import $ from "shexec";
     *
     * const proc = $.spawn`echo Hello, ${"world"}!`;
     *
     * proc.status.then(status => {
     *     console.log("Process exited with", status);
     * });
     *
     * // LOG: Process exited with { success: true, code: 0, signal: null }
     * ```
     */
    spawn: (
        template: TemplateStringsArray,
        ...substitutions: ShexecSubstitution
    ) => Deno.ChildProcess;

    /**
     * Executes a command using a template string for syntax. For more reference
     * regarding the template string syntax, see {@link ShexecSubstitution}.
     *
     * The spawned process uses ``Deno.ChildProcess``' to create the
     * sub process and returns it without any modificatio nor procedure.
     *
     * The stdio of the process is set to "inherit".
     *
     * @example
     * ```ts
     * import $ from "shexec";
     *
     * const proc = $.spawnInherit`echo Hello, ${"world"}!`;
     *
     * proc.status.then(status => {
     *     console.log("Process exited with", status);
     * });
     *
     * // LOG: Hello, world!
     * // LOG: Process exited with { code: 0, success: true, signal: null }
     * ```
     */
    spawnInherit: (
        template: TemplateStringsArray,
        ...substitutions: ShexecSubstitution
    ) => Deno.ChildProcess;
}

/**
 * Executes a command using a template string syntax and returns a promise
 * that resolves to the piped output of the process. For more details on template string syntax,
 * see {@link ShexecSubstitution}.
 *
 * Both ``stdout`` and ``stderr`` are decoded using ``TextDecoder`` in unix based systems and
 * ``iconv-lite`` in Windows based systems.
 *
 * @returns A promise that resolves to the piped output of the executed command.
 *
 * @example
 * ```ts
 * import $ from "shexec";
 *
 * const output = await $`echo Hello, ${"world"}!`;
 * console.log(output.decoded.stdout); // "Hello, world!\n"
 * ```
 */
const $ = exec as ShexecExports;

$.parse = parseCommandLine;
$.inherit = execInherit;
$.spawn = spawn;
$.spawnInherit = spawnInherit;

export default $;
