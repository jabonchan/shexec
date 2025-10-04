import { parseEscapeSequence } from "./parse-escape-sequence.ts";

/**
 * The values that can be used as substitutions in a shell command template.
 *
 * They can be:
 * - A string or number, which will be converted to a string and included as a single argument.
 * - An array of strings or numbers, which will be expanded into multiple arguments.
 */
export type ShexecSubstitution = Array<
    string | number | Array<string | number>
>;

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
export function parseCommandLine(
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
): { executable: string; arguments: string[] } {
    const args: string[] = [];
    const state = {
        quoted: false,
        escaped: false,
    };

    let sectionIndex = -1;
    let argument = "";

    for (const section of template.raw) {
        sectionIndex++;

        for (let index = 0; index < section.length; index++) {
            let char = section[index];

            switch (char) {
                case "\\":
                    if (state.escaped) break;

                    state.escaped = true;
                    continue;

                case '"':
                    if (state.escaped) break;

                    state.quoted = !state.quoted;

                    if (state.quoted) char = "";

                    if (!argument.length) {
                        if (!state.quoted) args.push("");
                        continue;
                    }

                    args.push(argument);
                    argument = "";

                    continue;
            }

            if (state.escaped) {
                const escape = parseEscapeSequence(section, index);

                if (!escape.char) {
                    throw new SyntaxError(
                        `Invalid escape sequence at section \x1b[33m${
                            sectionIndex + 1
                        }\x1b[0m, character \x1b[33m${
                            index + 1
                        }\x1b[0m:\x1b[96m\n> \x1b[91m\x1b[4m\\${
                            section.slice(index).replace(/\n/g, " ").trim()
                        }\x1b[0m`,
                    );
                }

                char = escape.char;
                index += escape.size - 1; // We do not count the current characters that make up the escape sequence
            }

            if (/\s/.test(char) && !state.quoted) {
                if (argument.length) args.push(argument);

                argument = "";
                char = "";
            }

            argument += char;
            state.escaped = false;
        }

        let substitution = substitutions.shift();
        if (substitution === undefined || substitution === null) break;

        if (Array.isArray(substitution)) {
            if (argument.length || state.quoted) {
                throw new Error(
                    "Can't combine an array of arguments with another argument(s)",
                );
            }

            args.push(...substitution.map((element) => element.toString()));
            continue;
        }

        substitution = substitution.toString();
        argument += substitution.toString();
    }

    if (argument.length) {
        args.push(argument);
        argument = "";
    }

    if (!args.length) {
        throw new Error("Executable not provided to command line");
    }

    return {
        executable: args.shift()!,
        arguments: args,
    };
}
