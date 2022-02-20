
/*
    Convert machine code into a schematic.
*/

const fs = require("fs");
const NBT = require("nbt-ts");
const zlib = require("zlib");
const { parse: Parse } = require("prismarine-nbt");

const { Short, Int } = require("nbt-ts");

WIDTH = 32;
LENGTH = 64;

(async () => {
    let program = fs.readFileSync('/dev/stdin').toString().split("\n").map((x) => x.split(""));
    let baseBoard = (await Parse(fs.readFileSync("BaseBoard.schem"))).parsed.value;
    let blockData = baseBoard.BlockData.value;

    for (let i = 0; i < program.length; i++) {
        for (let j = 0; j < program[i].length; j++) {
            blockData[(WIDTH * j * 4) + i * 2] = (program[i][j] == "1" ? 9 : 0)
        }
    }

    const Schematic = NBT.encode("Schematic", {
        Metadata: {
            WEOffsetX: new Int(-1),
            WEOffsetY: new Int(-1),
            WEOffsetZ: new Int(0),
        },
        Offset: new Int32Array([76, 79, 193]),
        Palette: {
            "minecraft:air": new Int(0),
            "minecraft:black_wool": new Int(1),
            "minecraft:light_blue_concrete": new Int(2),
            "minecraft:red_wool": new Int(3),
            "minecraft:orange_wool": new Int(4),
            "minecraft:yellow_wool": new Int(5),
            "minecraft:green_wool": new Int(6),
            "minecraft:blue_wool": new Int(7),
            "minecraft:purple_wool": new Int(8),
            "minecraft:redstone_wall_torch[facing=west,lit=false]": new Int(9),
            "minecraft:brown_wool": new Int(10),
            "minecraft:pink_wool": new Int(11),
            "minecraft:white_wool": new Int(12),
        },
        PaletteMax: new Int(13),
        DataVersion: new Int(baseBoard.DataVersion.value),
        Length: new Short(baseBoard.Length.value),
        Height: new Short(baseBoard.Height.value),
        Width: new Short(baseBoard.Width.value),
        Version: new Int(baseBoard.Version.value),
        BlockData: Buffer.from(new Uint8Array(blockData)),
    });


    // gzip the buffer and write
    zlib.gzip(Schematic, (_, data) => {
        fs.writeFileSync(process.stdout.fd, data);
    });

})()
