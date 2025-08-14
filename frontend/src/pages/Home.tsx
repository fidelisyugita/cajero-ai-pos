import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus } from "lucide-react";

// Dummy data
const products = [
  { id: 1, name: "Americano", price: 3.5, category: "Coffee" },
  { id: 2, name: "Latte", price: 4.0, category: "Coffee" },
  { id: 3, name: "Cappuccino", price: 4.0, category: "Coffee" },
  { id: 4, name: "Espresso", price: 2.5, category: "Coffee" },
  { id: 5, name: "Croissant", price: 3.0, category: "Pastry" },
  { id: 6, name: "Chocolate Muffin", price: 2.5, category: "Pastry" },
];

const categories = ["All", "Coffee", "Pastry", "Tea", "Snacks"];

export default function Home() {
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
            <div className="flex gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:bg-accent">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xl font-bold">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.category}
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
                  {products.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${product.price.toFixed(2)}
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
                    <span>$10.50</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (10%)</span>
                    <span>$1.05</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>$11.55</span>
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
