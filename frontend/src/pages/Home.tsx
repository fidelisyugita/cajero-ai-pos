import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus } from "lucide-react";
import { useProductCategories } from "@/hooks/useProductCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useProductCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(0);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Products Section */}
        <div className="col-span-8">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" />
              </div>
            </div>
            {isLoadingCategories ? (
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-9 w-[100px] rounded-full" />
                <Skeleton className="h-9 w-[100px] rounded-full" />
                <Skeleton className="h-9 w-[100px] rounded-full" />
              </div>
            ) : (
              <div className="flex gap-2 mb-6">
                {categoriesData?.map((category) => (
                  <Button
                    key={category.code}
                    variant={category.code === "All" ? "default" : "outline"}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {productsData?.content.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:bg-accent">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xl font-bold">{product.sellingPrice}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.stock} {product.measureUnitCode}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="col-span-4">
          <Card className="h-[calc(100vh-2rem)]">
            <CardHeader>
              <CardTitle>Current Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cart items */}
                <div className="space-y-4">
                  {productsData?.content.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sellingPrice}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">1</span>
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>10.50</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (10%)</span>
                    <span>1.05</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>11.55</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Button className="w-full">Complete Order</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
