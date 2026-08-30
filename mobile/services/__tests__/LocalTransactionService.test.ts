import { db, runInTransaction } from "@/db/drizzle";
import type { SignInResponse } from "@/services/types/Auth";
import { useAuthStore } from "@/store/useAuthStore";
import { toDate } from "@/utils/Date";
import { LocalTransactionService } from "../LocalTransactionService";

const mockUser: SignInResponse = {
  id: "user-1",
  name: "Cashier",
  email: "cashier@cajero.com",
  phone: null,
  roleCode: "CASHIER",
  storeId: "store-123",
  imageUrl: null,
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// Create flexible mock builder for chaining
const createMockQueryBuilder = () => {
  const builder: any = {};
  builder.from = jest.fn().mockImplementation(() => builder);
  builder.leftJoin = jest.fn().mockImplementation(() => builder);
  builder.where = jest.fn().mockImplementation(() => builder);
  builder.limit = jest.fn().mockImplementation(() => builder);
  builder.offset = jest.fn().mockImplementation(() => builder);
  builder.orderBy = jest.fn().mockImplementation(() => builder);
  builder.values = jest.fn().mockImplementation(() => builder);
  builder.set = jest.fn().mockImplementation(() => builder);
  builder.run = jest.fn().mockResolvedValue({ rowsAffected: 1 });
  return builder;
};

let mockDbBuilder = createMockQueryBuilder();
let mockTxBuilder = createMockQueryBuilder();

jest.mock("@/db/drizzle", () => ({
  db: {
    select: jest.fn(() => mockDbBuilder),
    insert: jest.fn(() => mockDbBuilder),
    update: jest.fn(() => mockDbBuilder),
    delete: jest.fn(() => mockDbBuilder),
    run: jest.fn(() => Promise.resolve()),
    transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => {
      return await cb({
        select: jest.fn(() => mockTxBuilder),
        insert: jest.fn(() => mockTxBuilder),
        update: jest.fn(() => mockTxBuilder),
        delete: jest.fn(() => mockTxBuilder),
        run: jest.fn(() => Promise.resolve()),
      });
    }),
  },
  runInTransaction: jest.fn(async (cb: (tx: any) => Promise<any>) => {
    return await cb({
      select: jest.fn(() => mockTxBuilder),
      insert: jest.fn(() => mockTxBuilder),
      update: jest.fn(() => mockTxBuilder),
      delete: jest.fn(() => mockTxBuilder),
      run: jest.fn(() => Promise.resolve()),
    });
  }),
}));

describe("LocalTransactionService", () => {
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
        run: jest.fn(() => Promise.resolve()),
      });
    });
    useAuthStore.setState({
      user: mockUser,
      isLoggedIn: true,
    });
  });

  describe("createTransaction", () => {
    it("throws an error if user is not logged in", async () => {
      useAuthStore.setState({ user: undefined, isLoggedIn: false });

      await expect(
        LocalTransactionService.createTransaction({
          totalPrice: 50000,
          totalTax: 5000,
          totalDiscount: 0,
          totalCommission: 0,
          paymentMethodCode: "CASH",
          transactionTypeCode: "SALE",
          statusCode: "COMPLETED",
          isIn: true,
          description: "Order 1",
          transactionProducts: [],
        } as any),
      ).rejects.toThrow("User not logged in");
    });

    it("inserts transaction and items, decrements stock, and returns summary", async () => {
      mockTxBuilder.where.mockResolvedValueOnce([{ name: "Latte" }]);

      const request: any = {
        customerId: "cust-1",
        totalPrice: 60000,
        totalTax: 6000,
        totalDiscount: 0,
        totalCommission: 0,
        paymentMethodCode: "CASH",
        transactionTypeCode: "SALE",
        statusCode: "COMPLETED",
        isIn: true,
        description: "Dine-in",
        transactionProducts: [
          {
            productId: "prod-latte",
            quantity: 2,
            sellingPrice: 30000,
            buyingPrice: 15000,
            tax: 3000,
            commission: 0,
            discount: 0,
            note: "Less sugar",
            selectedVariants: [{ groupName: "Size", name: "Large", price: 5000 }],
          },
        ],
      };

      const result = await LocalTransactionService.createTransaction(request);

      expect(runInTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.storeId).toBe("store-123");
      expect(result.totalPrice).toBe(60000);
      expect(result.statusCode).toBe("COMPLETED");
      expect(result).toHaveProperty("createdAt");
    });
  });

  describe("getTransactions", () => {
    it("fetches transactions with date and search filters and maps items", async () => {
      const mockTxns = [
        {
          id: "txn-1",
          storeId: "store-123",
          totalPrice: 50000,
          isIn: true,
          createdAt: toDate("2026-08-24T10:00:00.000Z"),
        },
      ];

      const mockItems = [
        {
          id: "item-1",
          transactionId: "txn-1",
          productId: "prod-1",
          quantity: 1,
          sellingPrice: 50000,
        },
      ];

      // Transaction select query ends on orderBy
      mockDbBuilder.orderBy.mockResolvedValueOnce(mockTxns);

      // Item query creates a second select chain which terminates on where(...)
      let isFirstWhere = true;
      mockDbBuilder.where.mockImplementation(() => {
        if (isFirstWhere) {
          isFirstWhere = false;
          return mockDbBuilder; // from where() in transactions query
        }
        return Promise.resolve(mockItems); // from where() in transactionItems query
      });

      const result = await LocalTransactionService.getTransactions({
        page: 0,
        size: 10,
        startDate: "2026-08-01",
        endDate: "2026-08-24",
        search: "txn",
      });

      expect(mockDbBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockDbBuilder.offset).toHaveBeenCalledWith(0);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("txn-1");
      expect(result[0].transactionProduct).toEqual(mockItems);
      expect(result[0].createdAt).toBe("2026-08-24T10:00:00.000Z");
    });
  });

  describe("getTransactionById", () => {
    it("returns null if transaction does not exist", async () => {
      mockDbBuilder.where.mockResolvedValueOnce([]);

      const result = await LocalTransactionService.getTransactionById("non-existent");
      expect(result).toBeNull();
    });

    it("returns full transaction with joined product names and details", async () => {
      const mockTxn = {
        id: "txn-100",
        storeId: "store-123",
        totalPrice: 45000,
        isIn: true,
        createdAt: toDate("2026-08-24T12:00:00.000Z"),
      };

      const mockJoinedItems = [
        {
          item: {
            id: "item-1",
            productId: "prod-1",
            quantity: 1,
            sellingPrice: 45000,
            productName: "Cached Product",
            note: "Extra hot",
            selectedVariants: null,
            buyingPrice: 20000,
            tax: 4500,
            commission: 0,
            discount: 0,
          },
          product: {
            id: "prod-1",
            name: "Flat White",
            imageUrl: "https://example.com/latte.jpg",
            categoryId: "cat-coffee",
            description: "Smooth espresso with milk",
          },
        },
      ];

      mockDbBuilder.where
        .mockResolvedValueOnce([mockTxn]) // First select: transaction header
        .mockResolvedValueOnce(mockJoinedItems); // Second select: joined items

      const result = await LocalTransactionService.getTransactionById("txn-100");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("txn-100");
      expect(result?.in).toBe(true);
      expect(result?.transactionProduct).toHaveLength(1);
      expect(result?.transactionProduct[0].name).toBe("Flat White");
      expect(result?.transactionProduct[0].imageUrl).toBe("https://example.com/latte.jpg");
    });

    it("falls back to item.productName or 'Unknown Product' when product table record is absent", async () => {
      const mockTxn = {
        id: "txn-200",
        storeId: "store-123",
        totalPrice: 20000,
        isIn: false,
        createdAt: null,
      };

      const mockJoinedItems = [
        {
          item: {
            id: "item-2",
            productId: "prod-2",
            quantity: 1,
            sellingPrice: 20000,
            productName: "Stored Item Name",
          },
          product: null,
        },
      ];

      mockDbBuilder.where.mockResolvedValueOnce([mockTxn]).mockResolvedValueOnce(mockJoinedItems);

      const result = await LocalTransactionService.getTransactionById("txn-200");

      expect(result?.createdAt).toBe("");
      expect(result?.in).toBe(false);
      expect(result?.transactionProduct[0].name).toBe("Stored Item Name");
    });
  });
});
