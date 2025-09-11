import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { DashboardLayout } from "@/components/DashboardLayout";

const Products = () => {
  const [page, setPage] = useState(0);

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
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Sold</th>
                  <th className="px-4 py-2">Updated By</th>
                  <th className="px-4 py-2">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.content.map((product) => (
                  <tr key={product.id}>
                    <td className="border px-4 py-2">{product.id}</td>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">{`${product.stock} ${product.measureUnitName}`}</td>
                    <td className="border px-4 py-2">{`${product.soldCount} ${product.measureUnitName}`}</td>
                    <td className="border px-4 py-2">{product.updatedBy}</td>
                    <td className="border px-4 py-2">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productsData && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page + 1} of {productsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= productsData.totalPages - 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;
