import { db } from "@/db/drizzle";
import { categories, products } from "@/db/schema";
import { toDate } from "@/utils/Date";
import { LocalProductService } from "../LocalProductService";

jest.mock("@/db/drizzle", () => {
  const mockQueryBuilder: any = {};
  mockQueryBuilder.from = jest.fn().mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.leftJoin = jest.fn().mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.where = jest.fn().mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.limit = jest.fn().mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.offset = jest.fn().mockReturnValue(mockQueryBuilder);
  mockQueryBuilder.set = jest.fn().mockReturnValue(mockQueryBuilder);

  return {
    db: {
      select: jest.fn(() => mockQueryBuilder),
      update: jest.fn(() => mockQueryBuilder),
    },
  };
});

describe("LocalProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProducts", () => {
    it("fetches products with category joined and default pagination", async () => {
      const mockRows = [
        {
          products: {
            id: "prod-1",
            name: "Espresso",
            categoryId: "cat-coffee",
            sellingPrice: 20000,
            deletedAt: null,
          },
          categories: {
            id: "cat-coffee",
            name: "Coffee",
          },
        },
      ];

      const queryBuilder = (db.select as jest.Mock)();
      queryBuilder.offset.mockResolvedValueOnce(mockRows);

      const result = await LocalProductService.getProducts();

      expect(db.select).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(products);
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith(categories, expect.anything());
      expect(queryBuilder.limit).toHaveBeenCalledWith(100);
      expect(queryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual([
        {
          id: "prod-1",
          name: "Espresso",
          categoryId: "cat-coffee",
          categoryCode: "cat-coffee",
          categoryName: "Coffee",
          sellingPrice: 20000,
          deletedAt: null,
        },
      ]);
    });

    it("applies search, categoryId, pagination, and includeDeleted filters", async () => {
      const mockRows = [
        {
          products: {
            id: "prod-1",
            name: "Latte",
            categoryId: "cat-coffee",
            sellingPrice: 28000,
            deletedAt: toDate("2026-01-01"),
          },
          categories: {
            id: "cat-coffee",
            name: "Coffee",
          },
        },
      ];

      const queryBuilder = (db.select as jest.Mock)();
      queryBuilder.offset.mockResolvedValueOnce(mockRows);

      const result = await LocalProductService.getProducts("Latte", "cat-coffee", 2, 10, true);

      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.limit).toHaveBeenCalledWith(10);
      expect(queryBuilder.offset).toHaveBeenCalledWith(20);
      expect(result[0].categoryCode).toBe("cat-coffee");
      expect(result[0].categoryName).toBe("Coffee");
    });
  });

  describe("getProductById", () => {
    it("returns product matching the given id", async () => {
      const mockProduct = {
        id: "prod-123",
        name: "Cappuccino",
        sellingPrice: 30000,
      };

      const queryBuilder = (db.select as jest.Mock)();
      queryBuilder.where.mockResolvedValueOnce([mockProduct]);

      const result = await LocalProductService.getProductById("prod-123");

      expect(db.select).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(products);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it("returns undefined if product is not found", async () => {
      const queryBuilder = (db.select as jest.Mock)();
      queryBuilder.where.mockResolvedValueOnce([]);

      const result = await LocalProductService.getProductById("non-existent");
      expect(result).toBeUndefined();
    });
  });

  describe("getCategories", () => {
    it("returns list of all categories", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Beverages" },
        { id: "cat-2", name: "Food" },
      ];

      const queryBuilder = (db.select as jest.Mock)();
      queryBuilder.from.mockResolvedValueOnce(mockCategories);

      const result = await LocalProductService.getCategories();

      expect(db.select).toHaveBeenCalled();
      expect(queryBuilder.from).toHaveBeenCalledWith(categories);
      expect(result).toEqual(mockCategories);
    });
  });

  describe("softDeleteProduct and restoreProduct", () => {
    it("sets deletedAt date on softDeleteProduct", async () => {
      const queryBuilder = (db.update as jest.Mock)();
      queryBuilder.where.mockResolvedValueOnce({ rowsAffected: 1 });

      await LocalProductService.softDeleteProduct("prod-1");

      expect(db.update).toHaveBeenCalledWith(products);
      expect(queryBuilder.set).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it("sets deletedAt to null on restoreProduct", async () => {
      const queryBuilder = (db.update as jest.Mock)();
      queryBuilder.where.mockResolvedValueOnce({ rowsAffected: 1 });

      await LocalProductService.restoreProduct("prod-1");

      expect(db.update).toHaveBeenCalledWith(products);
      expect(queryBuilder.set).toHaveBeenCalledWith({
        deletedAt: null,
      });
      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });
});
