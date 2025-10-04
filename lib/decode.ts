import { iconv } from "../deps.ts";

export const decodeUnix = TextDecoder.prototype.decode.bind(
    new TextDecoder("utf-8"),
);

export function decodeWin(buf: Uint8Array) {
    return iconv.decode(buf, "cp850");
}

export function decode(buf: Uint8Array) {
    if (Deno.build.os === "windows") return decodeWin(buf);
    return decodeUnix(buf);
}
