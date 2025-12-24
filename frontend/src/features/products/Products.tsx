import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { formatCurrency } from "@/lib/utils";
import { useProducts } from "./hooks";

const Products = () => {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const { data: productsData } = useProducts(page);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Products</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Sold</th>
                  <th className="px-4 py-3 text-right">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.content.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {product.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.categoryCode}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${
                        product.stock === 0
                          ? "text-red-600 font-medium"
                          : product.stock < 10
                          ? "text-amber-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {`${product.stock} ${product.measureUnitName}`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {`${product.soldCount} ${product.measureUnitName}`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productsData && (
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {productsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= productsData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;
