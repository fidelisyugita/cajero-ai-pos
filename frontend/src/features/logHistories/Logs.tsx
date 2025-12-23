import { useState } from "react";
import { Card } from "@/components/ui/card";
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
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">At</th>
                  <th className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logsData?.content.map((log) => (
                  <tr key={log.id}>
                    <td className="border px-4 py-2">{log.type}</td>
                    <td className="border px-4 py-2">{log.action}</td>
                    <td className="border px-4 py-2">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">
                      <table className="text-sm">
                        <tbody>
                          {log.details &&
                            Object.entries(log.details).map(
                              ([key, value]) => (
                                <tr key={key}>
                                  <td className="pr-2 font-semibold">{key}</td>
                                  <td>{JSON.stringify(value)}</td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logsData && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page + 1} of {logsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= logsData.totalPages - 1}
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

export default Logs;
