import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useStockMovements } from "./hooks";
import { useState } from "react";

const StockHistory = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useStockMovements(page);

  const stockMovements = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Stock Movements</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                Previous
              </Button>
              <span className="flex items-center px-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-left">Product/Ingredient</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map((movement: any) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movement.type === "SALE"
                              ? "bg-blue-100 text-blue-800"
                              : movement.type === "WASTE"
                              ? "bg-red-100 text-red-800"
                              : movement.type === "PURCHASE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {movement.type}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          movement.quantity < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {movement.productId || movement.ingredientId || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString()} {new Date(movement.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {stockMovements.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No stock movements found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StockHistory;
