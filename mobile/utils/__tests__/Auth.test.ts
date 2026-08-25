import bcrypt from "bcryptjs";
import { hashPassword } from "../Auth";

describe("Auth Utils", () => {
  describe("hashPassword", () => {
    it("should return a valid bcrypt hash string", () => {
      const plainPassword = "SecretPassword123!";
      const hash = hashPassword(plainPassword);

      expect(typeof hash).toBe("string");
      // bcrypt hashes start with $2a$ or $2b$ and have a total length of 60 chars
      expect(hash).toMatch(/^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/);
    });

    it("should produce a hash that validates successfully with bcrypt.compareSync", () => {
      const plainPassword = "MySecurePOSPassword";
      const hash = hashPassword(plainPassword);

      expect(bcrypt.compareSync(plainPassword, hash)).toBe(true);
      expect(bcrypt.compareSync("WrongPassword", hash)).toBe(false);
    });

    it("should generate distinct hashes for consecutive calls with the same password (salt uniqueness)", () => {
      const plainPassword = "IdenticalPassword";
      const hash1 = hashPassword(plainPassword);
      const hash2 = hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2);
      expect(bcrypt.compareSync(plainPassword, hash1)).toBe(true);
      expect(bcrypt.compareSync(plainPassword, hash2)).toBe(true);
    });

    it("should handle empty string password hashing", () => {
      const emptyPassword = "";
      const hash = hashPassword(emptyPassword);

      expect(typeof hash).toBe("string");
      expect(bcrypt.compareSync(emptyPassword, hash)).toBe(true);
      expect(bcrypt.compareSync("not-empty", hash)).toBe(false);
    });
  });
});
