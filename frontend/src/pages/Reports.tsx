import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { DashboardLayout } from "@/components/DashboardLayout";

const Reports = () => {
  const [productPage, setProductPage] = useState(0);
  const [transactionPage, setTransactionPage] = useState(0);

  const { data: productsData } = useProducts(productPage);
  const { data: transactionsData } = useTransactions(transactionPage);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product Report</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.content.map((product) => (
                  <tr key={product.id}>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">
                      ${product.sellingPrice}
                    </td>
                    <td className="border px-4 py-2">
                      {product.stockQuantity} {product.measureUnitCode}
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productsData && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                  disabled={productPage === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {productPage + 1} of {productsData.totalPages}
                </span>
                <button
                  onClick={() => setProductPage((p) => p + 1)}
                  disabled={productPage >= productsData.totalPages - 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction Report</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Payment Method</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {transactionsData?.content.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="border px-4 py-2">{transaction.id}</td>
                    <td className="border px-4 py-2">${transaction.total}</td>
                    <td className="border px-4 py-2">{transaction.status}</td>
                    <td className="border px-4 py-2">
                      {transaction.transactionType}
                    </td>
                    <td className="border px-4 py-2">
                      {transaction.paymentMethod}
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactionsData && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setTransactionPage((p) => Math.max(0, p - 1))}
                  disabled={transactionPage === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {transactionPage + 1} of {transactionsData.totalPages}
                </span>
                <button
                  onClick={() => setTransactionPage((p) => p + 1)}
                  disabled={transactionPage >= transactionsData.totalPages - 1}
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

export default Reports;
