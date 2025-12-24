import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useProductCategories } from "./hooks";

const Categories = () => {
  const { data: categories, isLoading } = useProductCategories();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product Category</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((category) => (
                    <tr
                      key={category.code}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">{category.code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {category.description}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {categories?.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No categories found
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

export default Categories;
