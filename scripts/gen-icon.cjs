// Minimal 16x16 ICO for Tauri Windows build (single image)
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src-tauri", "icons");
fs.mkdirSync(dir, { recursive: true });

const HEADER = Buffer.alloc(6);
HEADER.writeUInt16LE(0, 0);
HEADER.writeUInt16LE(1, 2);
HEADER.writeUInt16LE(1, 4);

const ENTRY = Buffer.alloc(16);
ENTRY.writeUInt16LE(16, 0);
ENTRY.writeUInt16LE(16, 2);
ENTRY.writeUInt16LE(0, 4);
ENTRY.writeUInt16LE(0, 6);
ENTRY.writeUInt16LE(1, 8);
ENTRY.writeUInt16LE(32, 10);
const rowPadded = 16 * 4;
const xorSize = rowPadded * 16;
const andRow = Math.floor((16 + 31) / 32) * 4;
const andSize = andRow * 16;
const bmpSize = 40 + xorSize + andSize;
ENTRY.writeUInt32LE(bmpSize, 8);
ENTRY.writeUInt32LE(22, 12);

const DIB = Buffer.alloc(40);
DIB.writeUInt32LE(40, 0);
DIB.writeInt32LE(32, 4);
DIB.writeInt32LE(16, 8);
DIB.writeUInt16LE(1, 12);
DIB.writeUInt16LE(32, 14);
DIB.writeUInt32LE(0, 16);
DIB.writeUInt32LE(16 * 16 * 4, 20);
DIB.writeInt32LE(0, 24);
DIB.writeInt32LE(0, 28);
DIB.writeUInt32LE(0, 32);
DIB.writeUInt32LE(0, 36);

const pixels = Buffer.alloc(xorSize);
for (let i = 0; i < 16 * 16 * 4; i += 4) {
  pixels[i] = 0x7a;
  pixels[i + 1] = 0xa2;
  pixels[i + 2] = 0xf7;
  pixels[i + 3] = 0xff;
}
const andMask = Buffer.alloc(andSize);
const ico = Buffer.concat([HEADER, ENTRY, DIB, pixels, andMask]);
fs.writeFileSync(path.join(dir, "icon.ico"), ico);
console.log("Created src-tauri/icons/icon.ico");
