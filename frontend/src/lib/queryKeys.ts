export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (page: number) => ["products", "list", page] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    categories: ["products", "categories"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (page: number) => ["transactions", "list", page] as const,
  },
  logs: {
    all: ["logs"] as const,
    list: (page: number) => ["logs", "list", page] as const,
  },
} as const;
