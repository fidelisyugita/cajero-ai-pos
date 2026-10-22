const { checkElfAlignment } = require("../check-16kb-alignment");

describe("check-16kb-alignment script", () => {
  it("rejects non-ELF binary input", () => {
    const invalidBuffer = Buffer.from("NOT_AN_ELF_BINARY_DATA");
    const result = checkElfAlignment(invalidBuffer);
    expect(result.isElf).toBe(false);
    expect(result.isCompliant).toBe(false);
  });

  it("permits 32-bit ELF binaries as exempt from 16 KB requirement", () => {
    const elf32Buffer = Buffer.alloc(64);
    elf32Buffer.write("\x7fELF", 0, "ascii");
    elf32Buffer[4] = 1; // 32-bit class

    const result = checkElfAlignment(elf32Buffer);
    expect(result.isElf).toBe(true);
    expect(result.is64Bit).toBe(false);
    expect(result.isCompliant).toBe(true);
  });

  it("validates 64-bit ELF binaries with 16 KB (0x4000) aligned PT_LOAD segments", () => {
    const elf64Buffer = Buffer.alloc(256);
    elf64Buffer.write("\x7fELF", 0, "ascii");
    elf64Buffer[4] = 2; // 64-bit class

    // Program header table offset: 64
    elf64Buffer.writeBigUInt64LE(64n, 32);
    // Program header entry size: 56
    elf64Buffer.writeUInt16LE(56, 54);
    // Number of program headers: 1
    elf64Buffer.writeUInt16LE(1, 56);

    // Entry 0: PT_LOAD
    const entryOffset = 64;
    elf64Buffer.writeUInt32LE(1, entryOffset); // p_type = PT_LOAD (1)
    elf64Buffer.writeBigUInt64LE(0x0000n, entryOffset + 8); // p_offset = 0x0000
    elf64Buffer.writeBigUInt64LE(0x0000n, entryOffset + 16); // p_vaddr = 0x0000
    elf64Buffer.writeBigUInt64LE(16384n, entryOffset + 48); // p_align = 16384 (16 KB)

    const result = checkElfAlignment(elf64Buffer);
    expect(result.isElf).toBe(true);
    expect(result.is64Bit).toBe(true);
    expect(result.isCompliant).toBe(true);
    expect(result.minAlignment).toBe(16384);
    expect(result.loadSegments[0].isAligned).toBe(true);
  });

  it("fails 64-bit ELF binaries with 4 KB (0x1000) aligned PT_LOAD segments", () => {
    const elf64Buffer = Buffer.alloc(256);
    elf64Buffer.write("\x7fELF", 0, "ascii");
    elf64Buffer[4] = 2; // 64-bit class

    elf64Buffer.writeBigUInt64LE(64n, 32);
    elf64Buffer.writeUInt16LE(56, 54);
    elf64Buffer.writeUInt16LE(1, 56);

    // Entry 0: PT_LOAD with 4096 alignment
    const entryOffset = 64;
    elf64Buffer.writeUInt32LE(1, entryOffset);
    elf64Buffer.writeBigUInt64LE(0x0000n, entryOffset + 8);
    elf64Buffer.writeBigUInt64LE(0x0000n, entryOffset + 16);
    elf64Buffer.writeBigUInt64LE(4096n, entryOffset + 48); // p_align = 4096 (4 KB)

    const result = checkElfAlignment(elf64Buffer);
    expect(result.isElf).toBe(true);
    expect(result.is64Bit).toBe(true);
    expect(result.isCompliant).toBe(false);
    expect(result.minAlignment).toBe(4096);
    expect(result.loadSegments[0].isAligned).toBe(false);
  });

  it("fails 64-bit ELF binaries when p_vaddr % p_align !== p_offset % p_align", () => {
    const elf64Buffer = Buffer.alloc(256);
    elf64Buffer.write("\x7fELF", 0, "ascii");
    elf64Buffer[4] = 2;

    elf64Buffer.writeBigUInt64LE(64n, 32);
    elf64Buffer.writeUInt16LE(56, 54);
    elf64Buffer.writeUInt16LE(1, 56);

    const entryOffset = 64;
    elf64Buffer.writeUInt32LE(1, entryOffset);
    elf64Buffer.writeBigUInt64LE(0x1000n, entryOffset + 8); // offset = 4096
    elf64Buffer.writeBigUInt64LE(0x2000n, entryOffset + 16); // vaddr = 8192 (modulo mismatch with 16384)
    elf64Buffer.writeBigUInt64LE(16384n, entryOffset + 48);

    const result = checkElfAlignment(elf64Buffer);
    expect(result.isCompliant).toBe(false);
  });
});
