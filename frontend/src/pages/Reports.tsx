import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLogs } from "@/hooks/useLogs";

const Reports = () => {
  const [reportPage, setReportPage] = useState(0);

  const { data: reportsData } = useLogs(reportPage);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Report</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Details</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {(reportsData?.content || []).map((report) => (
                  <tr key={report.id}>
                    <td className="border px-4 py-2">{report.id}</td>
                    <td className="border px-4 py-2">${report.type}</td>
                    <td className="border px-4 py-2">{report.action}</td>
                    <td className="border px-4 py-2">{report.details}</td>
                    <td className="border px-4 py-2">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportsData && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setReportPage((p) => Math.max(0, p - 1))}
                  disabled={reportPage === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {reportPage + 1} of {reportsData.totalPages}
                </span>
                <button
                  onClick={() => setReportPage((p) => p + 1)}
                  disabled={reportPage >= reportsData.totalPages - 1}
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
