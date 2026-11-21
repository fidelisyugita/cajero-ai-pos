import api from "@/lib/axios";
import type { ProductCategory } from "../types/ProductCategory";

let inFlightCategoryFetch: Promise<ProductCategory[]> | null = null;

export const getProductCategory = (): Promise<ProductCategory[]> => {
  if (inFlightCategoryFetch) {
    return inFlightCategoryFetch;
  }

  inFlightCategoryFetch = api
    .get<ProductCategory[]>("/product-category")
    .then((response) => response.data)
    .finally(() => {
      inFlightCategoryFetch = null;
    });

  return inFlightCategoryFetch;
};

export type { ProductCategory };
