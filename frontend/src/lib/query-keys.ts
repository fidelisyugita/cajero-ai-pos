export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (page: number) => ["products", "list", page] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  productCategories: {
    all: ["product-categories"] as const,
    list: (page: number) => ["product-categories", "list", page] as const,
    detail: (id: string) => ["product-categories", "detail", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (page: number) => ["transactions", "list", page] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },
  logs: {
    all: ["logs"] as const,
    list: (page: number) => ["logs", "list", page] as const,
  },
} as const;
