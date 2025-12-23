import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useDailyReport } from "./hooks";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), "yyyy-MM-01"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: reportData, isLoading } = useDailyReport(
    dateRange.startDate,
    dateRange.endDate
  );

  const summary = reportData?.summary;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <span>-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(summary.totalRevenue)}
              </p>
              <div className="text-sm text-green-600 mt-1">
                {summary.totalTransaction} transactions
              </div>
            </Card>

            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="text-sm font-semibold text-red-700 mb-2">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(summary.totalExpenses)}
              </p>
              <div className="text-sm text-red-600 mt-1">
                Net Revenue: {formatCurrency(summary.totalNetRevenue)}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">
                Summary
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Product Sold</span>
                  <span className="font-semibold">
                    {summary.totalProductSold}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Refund</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.totalRefund)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.totalTax)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Daily Report</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Expenses</th>
                    <th className="px-4 py-3 text-right">Net Revenue</th>
                    <th className="px-4 py-3 text-right">Trans.</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.dailyReports.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {format(new Date(day.date), "EEE, dd MMM")}
                        </div>
                        <div className="text-sm text-gray-500">{day.date}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        + {formatCurrency(day.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        - {formatCurrency(day.totalExpenses)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatCurrency(day.totalNetRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {day.totalTransaction}
                      </td>
                    </tr>
                  ))}
                  {reportData?.dailyReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No records found for this period
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

export default Reports;
