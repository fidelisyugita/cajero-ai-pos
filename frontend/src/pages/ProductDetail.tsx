import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/useProduct";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Detail</h1>
          <Button variant="outline" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={product.name} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" defaultValue={product.description} />
                </div>
                <div>
                  <Label htmlFor="stock">
                    Stock ({product.measureUnitName})
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    defaultValue={product.stock}
                  />
                </div>
                <div>
                  <Label htmlFor="buyingPrice">Buying Price</Label>
                  <Input
                    id="buyingPrice"
                    type="number"
                    defaultValue={product.buyingPrice}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    defaultValue={product.sellingPrice}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-2">
                  <img
                    src={imagePreview || product.imageUrl}
                    alt={product.name}
                    className="w-full max-w-md h-48 object-cover rounded-lg mb-4"
                  />
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-sm text-gray-600">Sold</div>
                    <div className="text-xl font-semibold">
                      {product.soldCount} {product.measureUnitName}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-sm text-gray-600">Rejected</div>
                    <div className="text-xl font-semibold">
                      {product.rejectCount} {product.measureUnitName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
