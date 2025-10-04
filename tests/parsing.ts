import { expect } from "@std/expect";
import $ from "../mod.ts";

Deno.test("parsing-command-line", async (t) => {
    await t.step("simple A argument with empty command", () => {
        const result = $.parse`"" a`;
        expect(result).toEqual({ executable: "", arguments: ["a"] });
    });

    await t.step("simple echo with empty array", () => {
        const result = $.parse`echo -e ${[]} "\\x61"`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["-e", "\\x61"],
        });
    });

    await t.step("simple closed argument next to array", () => {
        const result = $.parse`echo "Hi"${["World"]}`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["Hi", "World"],
        });
    });

    await t.step("simple command with one arg", () => {
        const result = $.parse`echo hello`;
        expect(result).toEqual({ executable: "echo", arguments: ["hello"] });
    });

    await t.step("quoted argument", () => {
        const result = $.parse`echo "hello world"`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["hello world"],
        });
    });

    await t.step("argument with escaped quote", () => {
        const result = $.parse`echo "hello \"world\"!"`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ['hello "world"!'],
        });
    });

    await t.step("substitution as argument", () => {
        const result = $.parse`echo ${"foo"}`;
        expect(result).toEqual({ executable: "echo", arguments: ["foo"] });
    });

    await t.step("array substitution as arguments", () => {
        const result = $.parse`echo ${["foo", "bar"]}`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["foo", "bar"],
        });
    });

    await t.step("substitution inside quoted argument", () => {
        const result = $.parse`echo "hello, ${"world"}!"`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["hello, world!"],
        });
    });

    await t.step("multiple substitutions", () => {
        const result = $.parse`cp ${"a.txt"} ${"b.txt"}`;
        expect(result).toEqual({
            executable: "cp",
            arguments: ["a.txt", "b.txt"],
        });
    });

    await t.step("escaped whitespace", () => {
        const result = $.parse`echo foo\tbar`;
        expect(result).toEqual({
            executable: "echo",
            arguments: ["foo", "bar"],
        });
    });

    await t.step("throws on array substitution with other argument", () => {
        expect(() => $.parse`echo foo${["bar", "baz"]}`).toThrow();
    });

    await t.step("throws on missing executable", () => {
        expect(() => $.parse``).toThrow();
    });
});
