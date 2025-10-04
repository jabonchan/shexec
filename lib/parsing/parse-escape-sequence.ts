const EXTENDED_UNICODE_SEQUENCE = /^\{([0-9a-f]{1,5})\}/i;
const UNICODE_SEQUENCE = /^[0-9a-f]{4}/i;
const HEX_SEQUENCE = /^[0-9a-f]{2}/i;

export function parseEscapeSequence(str: string, index: number) {
    const sequence = str.slice(index + 1, index + 8);
    const invalid = { char: null, size: 0 };
    const type = str[index];

    let size = 0;
    let hex = "";

    switch (type) {
        case "n":
            return { char: "\n", size: 1 };
        case "b":
            return { char: "\b", size: 1 };
        case "f":
            return { char: "\f", size: 1 };
        case "t":
            return { char: "\t", size: 1 };
        case "r":
            return { char: "\r", size: 1 };
        case "v":
            return { char: "\v", size: 1 };
        case "'":
            return { char: "'", size: 1 };
        case '"':
            return { char: '"', size: 1 };
        case "`":
            return { char: "`", size: 1 };
        case "\\":
            return { char: "\\", size: 1 };

        case "x":
            if (!HEX_SEQUENCE.test(sequence)) return invalid;

            size = 3; // x + XX
            hex = sequence.slice(0, 2);

            break;

        case "u":
            if (EXTENDED_UNICODE_SEQUENCE.test(sequence)) {
                hex = sequence.slice(1, sequence.indexOf("}"));
                size = hex.length + 3; // u + { + hex + }
                break;
            }

            if (UNICODE_SEQUENCE.test(sequence)) {
                size = 5; // u + XXXX
                hex = sequence.slice(0, 4);
                break;
            }

            return invalid;

        default:
            return invalid;
    }

    const code = parseInt(hex, 16);
    const char = String.fromCharCode(code);

    return { char, size };
}
