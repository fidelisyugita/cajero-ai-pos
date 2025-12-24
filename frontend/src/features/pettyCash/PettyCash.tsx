import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { formatCurrency } from "@/lib/utils";
import { usePettyCashs } from "./hooks";

const PettyCash = () => {
  const { data: pettyCashData, isLoading } = usePettyCashs();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Petty Cash</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Records</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pettyCashData?.content.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isIncome
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.isIncome ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          item.isIncome ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {pettyCashData?.content.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No records found
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

export default PettyCash;
