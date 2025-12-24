import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useLogs } from "./hooks";
const Logs = () => {
  const [page, setPage] = useState(0);

  const { data: logsData } = useLogs(page);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Logs</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">At</th>
                  <th className="px-4 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {logsData?.content.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {log.type}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.action}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <table className="w-full">
                        <tbody>
                          {log.details &&
                            Object.entries(log.details).map(([key, value]) => (
                              <tr key={key}>
                                <td className="pr-2 font-semibold text-gray-700">
                                  {key}:
                                </td>
                                <td className="text-gray-600">
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logsData && (
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {logsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= logsData.totalPages - 1}
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

export default Logs;
