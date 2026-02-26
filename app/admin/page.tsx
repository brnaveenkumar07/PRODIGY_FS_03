"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRenderableImageSrc, normalizeImageUrlInput } from "@/lib/image-utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  category: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: string | number;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDbError(null);
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products?limit=100"),
        fetch("/api/orders?limit=100"),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.data);
      } else {
        const errorData = await productsRes.json();
        setDbError(
          errorData.message ||
          errorData.error ||
          "Failed to load products"
        );
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data);
      } else {
        const errorData = await ordersRes.json().catch(() => ({}));
        toast.error(errorData.message || errorData.error || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setDbError("Failed to connect to database. Please check your DATABASE_URL in .env.local");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields (Name, Price, Stock)");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (parseInt(formData.stock) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
          stock: parseInt(formData.stock),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || "Failed to save product";
        throw new Error(errorMessage);
      }

      toast.success(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      resetForm();
      setProductDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to save product";
      
      // Check if it's a database connection error
      if (errorMsg.includes("does not exist") || errorMsg.includes("ECONNREFUSED")) {
        toast.error("Database not configured. Please set up your PostgreSQL database and run 'npm run db:push'");
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || "Failed to delete product";
        toast.error(errorMessage);
        return;
      }

      const data = await response.json().catch(() => ({}));
      const successMessage =
        data.message ||
        "Product deleted successfully!";
      toast.success(successMessage);
      fetchData();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete product";
      toast.error(errorMsg);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      imageUrl: product.imageUrl || "",
      category: product.category || "",
      stock: String(product.stock),
    });
    setProductDialog(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      toast.success("Order updated!");
      fetchData();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
      stock: "",
    });
    setEditingProduct(null);
  };
  const normalizedPreviewSource = normalizeImageUrlInput(formData.imageUrl) || formData.imageUrl;
  const previewImageUrl = getRenderableImageSrc(normalizedPreviewSource) || normalizedPreviewSource;

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Database Setup Warning */}
        {dbError && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">Database Setup Required</h3>
                  <p className="text-yellow-800 text-sm mb-4">{dbError}</p>
                  <div className="bg-white rounded p-3 border border-yellow-200 text-xs font-mono text-gray-700 space-y-2 mb-4">
                    <p># 1. Create PostgreSQL database (or use Neon/Railway)</p>
                    <p># 2. Update DATABASE_URL in .env.local</p>
                    <p># 3. Run: <span className="font-bold">npm run db:push</span></p>
                    <p># 4. Run: <span className="font-bold">npm run db:seed</span> (optional - adds sample data)</p>
                  </div>
                  <a 
                    href="https://neon.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-700 hover:text-yellow-900 underline text-sm"
                  >
                    Get free PostgreSQL from Neon →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">
                            Product Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">The name customers will see in your store</p>
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your product in detail..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            className="mt-2 min-h-24"
                          />
                          <p className="text-xs text-gray-500 mt-1">Provide details to help customers make a decision</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Inventory Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Pricing & Inventory</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price" className="text-sm font-medium">
                            Price <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-600">
                              $
                            </div>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({ ...formData, price: e.target.value })
                              }
                              className="pl-7"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Selling price per unit</p>
                        </div>
                        <div>
                          <Label htmlFor="stock" className="text-sm font-medium">
                            Stock <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            placeholder="0"
                            value={formData.stock}
                            onChange={(e) =>
                              setFormData({ ...formData, stock: e.target.value })
                            }
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Available units</p>
                        </div>
                      </div>
                    </div>

                    {/* Media & Categorization Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Media & Categorization</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="imageUrl" className="text-sm font-medium">
                            Image URL <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="imageUrl"
                            placeholder="Direct image URL, Google/Bing image link, or /product-images/item.svg"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, imageUrl: e.target.value })
                            }
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">You can paste direct image URLs from the web, and common browser image-result links are auto-converted.</p>
                          {formData.imageUrl && (
                            <img 
                              src={previewImageUrl} 
                              alt="Preview" 
                              className="mt-3 h-24 w-24 object-contain p-2 rounded border border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium">
                            Category <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <Input
                            id="category"
                            placeholder="e.g., Electronics, Fashion, Home"
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({ ...formData, category: e.target.value })
                            }
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Help customers find your product</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setProductDialog(false);
                          resetForm();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveProduct}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer"
                      >
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category || "—"}</TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.stock > 0 ? "outline" : "destructive"}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold">Order Management</h2>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            ${Number(order.totalAmount).toFixed(2)}
                          </TableCell>
                          <TableCell>View</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(status) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  status as OrderStatus
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">
                                  Delivered
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status as OrderStatus]}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

