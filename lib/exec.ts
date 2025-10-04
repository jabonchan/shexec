import type {
    ShexecExecInheritedOutput,
    ShexecExecPipedOutput,
} from "./output-type.ts";
import type { ShexecSubstitution } from "./parsing/parse-command-line.ts";
import { createProcess } from "./create-process.ts";
import { decode } from "./decode.ts";

export async function exec(
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
): Promise<ShexecExecPipedOutput> {
    const proc = createProcess("piped", template, ...substitutions);
    const output = await proc.output();

    const newOutput = {
        ...output,

        decoded: {
            stdout: decode(output.stdout),
            stderr: decode(output.stderr),
        },
    };

    proc.stdin.close();
    return newOutput;
}

export async function execInherit(
    template: TemplateStringsArray,
    ...substitutions: ShexecSubstitution
): Promise<ShexecExecInheritedOutput> {
    const proc = createProcess("inherit", template, ...substitutions);
    const output = await proc.output();

    // @ts-ignore - those throw errors because aren't piped
    delete output.stdin; // @ts-ignore - those throw errors because aren't piped
    delete output.stdout; // @ts-ignore - those throw errors because aren't piped
    delete output.stderr;

    return output;
}
