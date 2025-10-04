/**
 * Represents the output of a piped stdio shell execution.
 *
 * @property decoded - Contains the decoded output streams as strings.
 * @property decoded.stdout - The decoded standard output as a string.
 * @property decoded.stderr - The decoded standard error as a string.
 * @property stdout - The raw standard output as a Uint8Array.
 * @property stderr - The raw standard error as a Uint8Array.
 * @property success - Indicates whether the execution was successful.
 * @property code - The exit code of the process.
 * @property signal - The signal that caused the process to terminate, or null if none.
 */
export interface ShexecExecPipedOutput {
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

/**
 * Represents the output of a inherited shell execution.
 *
 * @property success - Indicates whether the execution was successful.
 * @property code - The exit code of the process.
 * @property signal - The signal that caused the process to terminate, or null if none.
 */
export interface ShexecExecInheritedOutput {
    success: boolean;
    code: number;
    signal: Deno.Signal | null;
}
