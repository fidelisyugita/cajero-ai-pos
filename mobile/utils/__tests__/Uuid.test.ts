import * as Crypto from "expo-crypto";
import { generateUUID } from "../Uuid";

describe("generateUUID", () => {
  it("calls expo-crypto randomUUID", () => {
    const spy = jest.spyOn(Crypto, "randomUUID");
    generateUUID();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns a string", () => {
    const result = generateUUID();
    expect(typeof result).toBe("string");
  });

  it("returns a valid UUID v4 format", () => {
    const realUUID = crypto.randomUUID();
    jest
      .spyOn(Crypto, "randomUUID")
      .mockReturnValueOnce(realUUID as `${string}-${string}-${string}-${string}-${string}`);

    const result = generateUUID();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidV4Regex.test(result)).toBe(true);
  });

  it("generates unique values", () => {
    let callCount = 0;
    jest.spyOn(Crypto, "randomUUID").mockImplementation(() => {
      callCount++;
      return `test-uuid-${callCount}-0000-0000-0000-000000000000` as `${string}-${string}-${string}-${string}-${string}`;
    });

    const id1 = generateUUID();
    const id2 = generateUUID();
    expect(id1).not.toBe(id2);
  });
});
