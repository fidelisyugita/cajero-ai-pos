import { db, runInTransaction } from "@/db/drizzle";
import api from "@/lib/axios";
import type { SignInResponse } from "@/services/types/Auth";
import { useAuthStore } from "@/store/useAuthStore";
import Logger from "../logger";
import { SyncService } from "../SyncService";

const mockUser: SignInResponse = {
  id: "user-1",
  name: "Admin",
  email: "admin@cajero.com",
  phone: null,
  storeId: "store-1",
  roleCode: "ADMIN",
  imageUrl: null,
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const createMockQueryBuilder = () => {
  const builder: any = {};
  builder.from = jest.fn().mockImplementation(() => builder);
  builder.where = jest.fn().mockImplementation(() => builder);
  builder.values = jest.fn().mockImplementation(() => builder);
  builder.set = jest.fn().mockImplementation(() => builder);
  builder.onConflictDoUpdate = jest.fn().mockImplementation(() => builder);
  builder.delete = jest.fn().mockImplementation(() => builder);
  return builder;
};

let mockDbBuilder = createMockQueryBuilder();
let mockTxBuilder = createMockQueryBuilder();

jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("@/db/drizzle", () => ({
  db: {
    select: jest.fn(() => mockDbBuilder),
    insert: jest.fn(() => mockDbBuilder),
    update: jest.fn(() => mockDbBuilder),
    delete: jest.fn(() => mockDbBuilder),
    transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb({
        select: jest.fn(() => mockTxBuilder),
        insert: jest.fn(() => mockTxBuilder),
        update: jest.fn(() => mockTxBuilder),
        delete: jest.fn(() => mockTxBuilder),
      });
    }),
  },
  runInTransaction: jest.fn(async (cb: (tx: any) => Promise<any>) => {
    return await cb({
      select: jest.fn(() => mockTxBuilder),
      insert: jest.fn(() => mockTxBuilder),
      update: jest.fn(() => mockTxBuilder),
      delete: jest.fn(() => mockTxBuilder),
    });
  }),
}));

jest.mock("../logger", () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe("SyncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbBuilder = createMockQueryBuilder();
    mockTxBuilder = createMockQueryBuilder();

    (db.select as jest.Mock).mockImplementation(() => mockDbBuilder);
    (db.insert as jest.Mock).mockImplementation(() => mockDbBuilder);
    (runInTransaction as jest.Mock).mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return await cb({
        select: jest.fn(() => mockTxBuilder),
        insert: jest.fn(() => mockTxBuilder),
        update: jest.fn(() => mockTxBuilder),
        delete: jest.fn(() => mockTxBuilder),
      });
    });

    useAuthStore.setState({
      user: mockUser,
      isLoggedIn: true,
    });
  });

  describe("syncProducts", () => {
    it("returns false if user is not logged in", async () => {
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      const result = await SyncService.syncProducts();
      expect(result).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("fetches single page products from API and upserts into local DB", async () => {
      const mockApiResponse = {
        data: {
          content: [
            {
              id: "p1",
              name: "Iced Coffee",
              description: "Cold brew with milk",
              sellingPrice: 25000,
              buyingPrice: 10000,
              stock: 50,
              categoryCode: "cat-bev",
              imageUrl: "https://example.com/p1.jpg",
              barcode: "123456",
              tax: 2500,
              commission: 0,
              discount: 0,
              measureUnitCode: "CUP",
              measureUnitName: "Cup",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-02T00:00:00.000Z",
              deletedAt: null,
              ingredients: [
                {
                  ingredientId: "ing-1",
                  name: "Coffee Beans",
                  stock: 100,
                  measureUnitCode: "GR",
                  measureUnitName: "Gram",
                  quantityNeeded: 20,
                },
              ],
            },
          ],
          last: true,
          totalPages: 1,
        },
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await SyncService.syncProducts();

      expect(api.get).toHaveBeenCalledWith("/product?page=0&size=100&includeDeleted=true");
      expect(runInTransaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("fetches multiple pages of products until last is true", async () => {
      const page0 = {
        data: {
          content: [
            {
              id: "p1",
              name: "Product 1",
              sellingPrice: 10000,
              categoryCode: "cat-1",
            },
          ],
          last: false,
          totalPages: 2,
        },
      };
      const page1 = {
        data: {
          content: [
            {
              id: "p2",
              name: "Product 2",
              sellingPrice: 20000,
              categoryCode: "cat-1",
            },
          ],
          last: true,
          totalPages: 2,
        },
      };

      (api.get as jest.Mock).mockResolvedValueOnce(page0).mockResolvedValueOnce(page1);

      const result = await SyncService.syncProducts();

      expect(api.get).toHaveBeenCalledWith("/product?page=0&size=100&includeDeleted=true");
      expect(api.get).toHaveBeenCalledWith("/product?page=1&size=100&includeDeleted=true");
      expect(runInTransaction).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it("retries on 504 Gateway Timeout and recovers on subsequent attempt", async () => {
      const error504 = { response: { status: 504 } };
      const successResponse = {
        data: {
          content: [
            {
              id: "p1",
              name: "Iced Tea",
              sellingPrice: 15000,
              categoryCode: "cat-bev",
            },
          ],
          last: true,
        },
      };

      (api.get as jest.Mock).mockRejectedValueOnce(error504).mockResolvedValueOnce(successResponse);

      const result = await SyncService.syncProducts();

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(Logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Retrying product sync page 0"),
      );
      expect(result).toBe(true);
    });

    it("logs error and returns false if api.get continuously throws", async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error("Fatal connection failure"));

      const result = await SyncService.syncProducts();

      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith("Sync products failed:", expect.any(Error));
    });
  });

  describe("syncCategories", () => {
    it("returns false if user is not logged in", async () => {
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      const result = await SyncService.syncCategories();
      expect(result).toBe(false);
    });

    it("fetches categories from API and upserts them locally", async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            code: "cat-1",
            name: "Food",
            description: "Delicious dishes",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            deletedAt: null,
          },
        ],
      });

      const result = await SyncService.syncCategories();

      expect(api.get).toHaveBeenCalledWith("/product-category");
      expect(runInTransaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("logs error and returns false on failure", async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error("Category fetch failed"));
      const result = await SyncService.syncCategories();
      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith("Sync categories failed:", expect.any(Error));
    });
  });

  describe("syncTransactions", () => {
    it("returns false if user is not logged in", async () => {
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      const result = await SyncService.syncTransactions();
      expect(result).toBe(false);
    });

    it("fetches remote transactions and updates local DB", async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          content: [
            {
              id: "txn-remote-1",
              storeId: "store-1",
              customerId: "cust-1",
              totalPrice: 50000,
              totalTax: 5000,
              totalDiscount: 0,
              totalCommission: 0,
              paymentMethodCode: "CASH",
              transactionTypeCode: "SALE",
              statusCode: "COMPLETED",
              in: true,
              description: "POS sync",
              createdAt: "2026-08-24T10:00:00.000Z",
              transactionProduct: [
                {
                  id: "item-remote-1",
                  productId: "p1",
                  quantity: 2,
                  sellingPrice: 25000,
                  buyingPrice: 10000,
                  tax: 2500,
                  commission: 0,
                  discount: 0,
                  note: "Cold",
                  selectedVariants: [{ name: "Sugar Free" }],
                  name: "Iced Coffee",
                },
              ],
            },
          ],
        },
      });

      const result = await SyncService.syncTransactions();

      expect(api.get).toHaveBeenCalledWith("/transaction?size=100&sort=createdAt,desc");
      expect(runInTransaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("logs error and returns false on failure", async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error("Transactions pull failed"));
      const result = await SyncService.syncTransactions();
      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith("Sync transactions failed:", expect.any(Error));
    });
  });

  describe("pushTransactions", () => {
    it("returns false if user is not logged in", async () => {
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      const result = await SyncService.pushTransactions();
      expect(result).toBe(false);
    });

    it("pushes unsynced transactions and replaces local row if server ID already exists", async () => {
      mockDbBuilder.where.mockResolvedValueOnce([
        {
          id: "local-txn-1",
          storeId: "store-1",
          totalPrice: 25000,
          totalTax: 0,
          totalDiscount: 0,
          totalCommission: 0,
          paymentMethodCode: "CASH",
          transactionTypeCode: "SALE",
          statusCode: "COMPLETED",
          isIn: true,
          description: "Local sale",
          createdAt: new Date("2026-08-24T10:00:00.000Z"),
        },
      ]);

      mockDbBuilder.where.mockResolvedValueOnce([
        {
          id: "item-1",
          productId: "p1",
          quantity: 1,
          sellingPrice: 25000,
          buyingPrice: 10000,
          tax: 0,
          commission: 0,
          discount: 0,
          selectedVariants: JSON.stringify([{ name: "Regular" }]),
        },
      ]);

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: {
          id: "already-existing-server-id",
          totalPrice: 25000,
          totalTax: 0,
          totalDiscount: 0,
          totalCommission: 0,
          createdAt: "2026-08-24T10:00:00.000Z",
        },
      });

      mockTxBuilder.where.mockResolvedValueOnce([{ id: "already-existing-server-id" }]);

      const result = await SyncService.pushTransactions();

      expect(result).toBe(true);
      expect(runInTransaction).toHaveBeenCalled();
    });

    it("logs error and returns false if post fails", async () => {
      mockDbBuilder.where.mockResolvedValueOnce([{ id: "local-txn-fail" }]);
      mockDbBuilder.where.mockResolvedValueOnce([]);
      (api.post as jest.Mock).mockRejectedValueOnce(new Error("Push failed"));

      const result = await SyncService.pushTransactions();

      expect(result).toBe(false);
      expect(Logger.error).toHaveBeenCalledWith("Push transactions failed:", expect.any(Error));
    });
  });

  describe("syncAll", () => {
    it("orchestrates syncCategories, syncProducts, pushTransactions, and syncTransactions", async () => {
      const syncCategoriesSpy = jest.spyOn(SyncService, "syncCategories").mockResolvedValue(true);
      const syncProductsSpy = jest.spyOn(SyncService, "syncProducts").mockResolvedValue(true);
      const pushTransactionsSpy = jest
        .spyOn(SyncService, "pushTransactions")
        .mockResolvedValue(true);
      const syncTransactionsSpy = jest
        .spyOn(SyncService, "syncTransactions")
        .mockResolvedValue(true);

      await SyncService.syncAll();

      expect(syncCategoriesSpy).toHaveBeenCalled();
      expect(syncProductsSpy).toHaveBeenCalled();
      expect(pushTransactionsSpy).toHaveBeenCalled();
      expect(syncTransactionsSpy).toHaveBeenCalled();

      syncCategoriesSpy.mockRestore();
      syncProductsSpy.mockRestore();
      pushTransactionsSpy.mockRestore();
      syncTransactionsSpy.mockRestore();
    });

    it("de-duplicates concurrent syncAll calls using shared in-flight promise", async () => {
      const syncCategoriesSpy = jest
        .spyOn(SyncService, "syncCategories")
        .mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 20));
          return true;
        });
      const syncProductsSpy = jest.spyOn(SyncService, "syncProducts").mockResolvedValue(true);
      const pushTransactionsSpy = jest
        .spyOn(SyncService, "pushTransactions")
        .mockResolvedValue(true);
      const syncTransactionsSpy = jest
        .spyOn(SyncService, "syncTransactions")
        .mockResolvedValue(true);

      await Promise.all([SyncService.syncAll(), SyncService.syncAll()]);

      expect(syncCategoriesSpy).toHaveBeenCalledTimes(1);
      expect(syncProductsSpy).toHaveBeenCalledTimes(1);

      syncCategoriesSpy.mockRestore();
      syncProductsSpy.mockRestore();
      pushTransactionsSpy.mockRestore();
      syncTransactionsSpy.mockRestore();
    });
  });

  describe("getUnsyncedCount", () => {
    it("returns count of unsynced transactions", async () => {
      mockDbBuilder.where.mockResolvedValueOnce([{ id: "t1" }, { id: "t2" }, { id: "t3" }]);

      const count = await SyncService.getUnsyncedCount();
      expect(count).toBe(3);
    });

    it("logs error and returns 0 when query fails", async () => {
      mockDbBuilder.where.mockRejectedValueOnce(new Error("DB read error"));

      const count = await SyncService.getUnsyncedCount();

      expect(count).toBe(0);
      expect(Logger.error).toHaveBeenCalledWith("Failed to get unsynced count", expect.any(Error));
    });
  });
});
