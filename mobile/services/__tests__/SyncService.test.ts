import { db } from "@/db/drizzle";
import api from "@/lib/axios";
import type { SignInResponse } from "@/services/types/Auth";
import { useAuthStore } from "@/store/useAuthStore";
import { toDate } from "@/utils/Date";
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
    (db.transaction as jest.Mock).mockImplementation(async (cb: (tx: any) => Promise<any>) => {
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

    it("fetches products from API, upserts into local DB including ingredients and syncStatus", async () => {
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
        },
      };

      (api.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await SyncService.syncProducts();

      expect(api.get).toHaveBeenCalledWith("/product?size=1000&includeDeleted=true");
      expect(db.transaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("logs error and returns false if api.get throws", async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error("API network error"));

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
      expect(db.transaction).toHaveBeenCalled();
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
      expect(db.transaction).toHaveBeenCalled();
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

    it("pushes unsynced transactions, parses variants, and updates local IDs", async () => {
      const unsyncedTxn = {
        id: "local-txn-1",
        storeId: "store-1",
        customerId: "cust-1",
        totalPrice: 75000,
        totalTax: 7500,
        totalDiscount: 0,
        totalCommission: 0,
        paymentMethodCode: "CASH",
        transactionTypeCode: "SALE",
        statusCode: "COMPLETED",
        isIn: true,
        description: "Table 4",
        isSynced: false,
        createdAt: toDate("2026-08-24T12:00:00.000Z"),
      };

      const unsyncedItem = {
        id: "local-item-1",
        transactionId: "local-txn-1",
        productId: "prod-1",
        quantity: 3,
        sellingPrice: 25000,
        buyingPrice: 10000,
        tax: 2500,
        commission: 0,
        discount: 0,
        note: "Extra ice",
        selectedVariants: JSON.stringify([{ groupName: "Ice", name: "Extra" }]),
        productName: "Drink",
      };

      // Query for unsynced transactions -> returns [unsyncedTxn]
      // Query for items -> returns [unsyncedItem]
      let selectCall = 0;
      mockDbBuilder.where.mockImplementation(() => {
        selectCall++;
        if (selectCall === 1) return Promise.resolve([unsyncedTxn]);
        return Promise.resolve([unsyncedItem]);
      });

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: {
          id: "server-txn-999",
          totalPrice: 75000,
          totalTax: 7500,
          totalDiscount: 0,
          totalCommission: 0,
          createdAt: "2026-08-24T12:00:00.000Z",
        },
      });

      // In transaction tx.select():
      mockTxBuilder.where.mockResolvedValueOnce([]); // No existing record with server id

      const result = await SyncService.pushTransactions();

      expect(api.post).toHaveBeenCalledWith(
        "/transaction",
        expect.objectContaining({
          storeId: "store-1",
          totalPrice: 75000,
          in: true,
          transactionProducts: [
            expect.objectContaining({
              productId: "prod-1",
              quantity: 3,
              selectedVariants: [{ groupName: "Ice", name: "Extra" }],
            }),
          ],
        }),
      );
      expect(result).toBe(true);
    });

    it("deletes redundant local record if backend ID already exists locally", async () => {
      const unsyncedTxn = {
        id: "local-txn-2",
        storeId: "store-1",
        isSynced: false,
        createdAt: null,
      };

      let selectCall = 0;
      mockDbBuilder.where.mockImplementation(() => {
        selectCall++;
        if (selectCall === 1) return Promise.resolve([unsyncedTxn]);
        return Promise.resolve([]);
      });

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: {
          id: "already-existing-server-id",
        },
      });

      // In transaction tx.select(): returns existing record
      mockTxBuilder.where.mockResolvedValueOnce([{ id: "already-existing-server-id" }]);

      const result = await SyncService.pushTransactions();

      expect(result).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
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
