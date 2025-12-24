import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus, CreditCard, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useProducts } from "../products/hooks";
import { useProductCategories } from "../productCategories/hooks";

export default function Home() {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useProductCategories();
  const { data: productsData } = useProducts(0);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
        {/* Products Section */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
          <div className="mb-6 flex-none">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-10 h-10 border-muted-foreground/20 focus:border-primary/50 transition-colors" 
                />
              </div>
            </div>
            {isLoadingCategories ? (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Skeleton className="h-10 w-[100px] rounded-full flex-shrink-0" />
                <Skeleton className="h-10 w-[100px] rounded-full flex-shrink-0" />
                <Skeleton className="h-10 w-[100px] rounded-full flex-shrink-0" />
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categoriesData?.map((category) => (
                  <Button
                    key={category.code}
                    variant={category.code === "All" ? "default" : "outline"}
                    className={`rounded-full flex-shrink-0 px-6 ${
                        category.code === "All" ? "shadow-md" : "border-muted-foreground/20"
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {productsData?.content.map((product) => (
                <Card 
                    key={product.id} 
                    className="cursor-pointer group hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                    <div className="aspect-square bg-muted/30 relative flex items-center justify-center">
                        {/* Placeholder for Product Image */}
                        <div className="text-4xl">📦</div> 
                    </div>
                    <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-foreground">
                            ${product.sellingPrice}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            {product.stock} {product.measureUnitCode}
                        </p>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="hidden lg:flex col-span-4 flex-col h-full">
          <Card className="flex-1 flex flex-col border-0 shadow-xl overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Order</CardTitle>
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                         <div className="h-full w-full bg-destructive/10 text-destructive rounded-md flex items-center justify-center">
                            <span className="text-xs">🗑️</span>
                         </div>
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Cart items */}
                {productsData?.content.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-transparent hover:border-border transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          ${product.sellingPrice}
                        </p>
                      </div>
                      <div className="flex items-center bg-background rounded-md border shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">1</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-muted/5 border-t space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">10.50</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (10%)</span>
                        <span className="font-medium">1.05</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-end">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">11.55</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full flex-col h-auto py-3 gap-1 hover:bg-primary/5 hover:border-primary/30">
                        <Wallet className="h-5 w-5 mb-1" />
                        <span className="text-xs">Cash</span>
                    </Button>
                    <Button variant="outline" className="w-full flex-col h-auto py-3 gap-1 hover:bg-primary/5 hover:border-primary/30">
                        <CreditCard className="h-5 w-5 mb-1" />
                        <span className="text-xs">Card</span>
                    </Button>
                 </div>

                 <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30">
                    Charge $11.55
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
