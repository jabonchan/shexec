import {
    parseCommandLine,
    type ShexecSubstitution,
} from "./parsing/parse-command-line.ts";

export function createProcess(
    stdio: "inherit" | "piped",
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
) {
    const cli = parseCommandLine(template, ...substitutions);
    const cmd = new Deno.Command(cli.executable, {
        args: cli.arguments,
        stdin: stdio,
        stdout: stdio,
        stderr: stdio,
    });

    const proc = cmd.spawn();
    return proc;
}
