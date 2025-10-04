import { expect } from "@std/expect";
import $ from "../mod.ts";

const unix = Deno.build.os !== "windows";

Deno.test("spawning-processes", async (t) => {
    await t.step("exec piped", async () => {
        const promise = unix
            ? $`echo Hello, ${"world"}!`
            : $`cmd /c echo Hello, ${"world"}!`;
        const output = await promise;

        expect(output.decoded.stdout.trim()).toBe("Hello, world!");
        expect(output.decoded.stderr).toBe("");
        expect(output.success).toBe(true);
        expect(output.code).toBe(0);
        expect(output.signal).toBe(null);
    });

    await t.step("windows encoding", async () => {
        if (unix) return;

        const output = await $`cmd /c echo òéà`;

        expect(output.decoded.stdout.trim()).toBe("òéà");
    });

    await t.step("exec inherit", async () => {
        const proc = unix
            ? $.spawnInherit`echo Hello, ${"world"}!`
            : $.spawnInherit`cmd /c echo Hello, ${"world"}!`;
        const status = await proc.status;

        expect(status.success).toBe(true);
        expect(status.code).toBe(0);
        expect(status.signal).toBe(null);
    });

    await t.step("spawn piped", async () => {
        const proc = unix
            ? $.spawn`echo Hello, ${"world"}!`
            : $.spawn`cmd /c echo Hello, ${"world"}!`;
        const status = await proc.status;
        proc.stdin;

        expect(status.success).toBe(true);
        expect(status.code).toBe(0);
        expect(status.signal).toBe(null);

        proc.stdin.close();
        proc.stderr.cancel();
        proc.stdout.cancel();
    });

    await t.step("spawn inherit", async () => {
        const proc = unix
            ? $.spawnInherit`echo Hello, ${"world"}!`
            : $.spawnInherit`cmd /c echo Hello, ${"world"}!`;
        const status = await proc.status;

        expect(status.success).toBe(true);
        expect(status.code).toBe(0);
        expect(status.signal).toBe(null);
    });
});
