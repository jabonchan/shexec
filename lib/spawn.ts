import type { ShexecSubstitution } from "./parsing/parse-command-line.ts";
import { createProcess } from "./create-process.ts";

export function spawn(
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
): Deno.ChildProcess {
    return createProcess("piped", template, ...substitutions);
}

export function spawnInherit(
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
): Deno.ChildProcess {
    return createProcess("inherit", template, ...substitutions);
}
