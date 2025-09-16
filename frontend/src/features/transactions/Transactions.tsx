import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useTransactions } from "./hooks";

const Transactions = () => {
  const [page, setPage] = useState(0);

  const { data: transactionsData } = useTransactions(page);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction</h2>
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
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page + 1} of {transactionsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= transactionsData.totalPages - 1}
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

export default Transactions;
