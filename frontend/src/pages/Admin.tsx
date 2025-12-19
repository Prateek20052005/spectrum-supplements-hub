import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { X, Plus, Edit, Trash2, Package, User, DollarSign } from "lucide-react";
import { formatINR } from "@/utils/currency";
import { CATEGORIES } from "@/constants/categories";

type Product = {
  _id?: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  description?: string;
  stock?: number;
  images?: string[];
  flavours?: string[];
};

type Order = {
  _id: string;
  userId?: { fullName?: string; email?: string };
  user?: { fullName?: string; email?: string };
  totalAmount?: number;
  totalPrice?: number;
  orderStatus?: string;
  status?: string;
  items?: Array<{ name?: string; quantity?: number; price?: number }>;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Admin = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product & { imageUrls: string }>({
    name: "",
    price: 0,
    brand: "",
    category: "",
    description: "",
    stock: 0,
    images: [],
    flavours: [],
    imageUrls: "",
  });

  let userInfo: any = null;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        userInfo = JSON.parse(stored);
      } catch {
        userInfo = null;
      }
    }
  }
  const token = userInfo?.token;

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading products",
        description: error.message || "Could not fetch products.",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            (res.status === 401
              ? "Unauthorized. Please log in as an admin user."
              : "Failed to load orders")
        );
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading orders",
        description: error.message || "Could not fetch orders.",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleImageUrlsChange = (value: string) => {
    setForm({ ...form, imageUrls: value });
    // Parse comma or newline separated URLs
    const urls = value
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
    setForm({ ...form, imageUrls: value, images: urls });
  };

  const handleFlavoursChange = (value: string) => {
    const flavours = value
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    setForm((prev) => ({ ...prev, flavours }));
  };

  const handleSubmitProduct = async () => {
    if (!form.name || !form.price) {
      toast({
        variant: "destructive",
        title: "Missing product data",
        description: "Name and price are required.",
      });
      return;
    }

    try {
      const method = editingProduct?._id ? "PUT" : "POST";
      const url =
        method === "POST"
          ? `${API_BASE_URL}/api/products`
          : `${API_BASE_URL}/api/products/${editingProduct?._id}`;

      const payload = {
        name: form.name,
        price: form.price,
        brand: form.brand || undefined,
        category: form.category || undefined,
        description: form.description || undefined,
        stock: form.stock || 0,
        images: form.images || [],
        flavours: form.flavours || [],
      };

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save product");
      }

      toast({
        title: "Product saved",
        description: `Product "${data.name}" has been ${method === "POST" ? "created" : "updated"}.`,
      });

      setForm({
        name: "",
        price: 0,
        brand: "",
        category: "",
        description: "",
        stock: 0,
        images: [],
        flavours: [],
        imageUrls: "",
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving product",
        description: error.message || "Please check your admin permissions and try again.",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      brand: product.brand || "",
      category: product.category || "",
      description: product.description || "",
      stock: product.stock || 0,
      images: product.images || [],
      flavours: product.flavours || [],
      imageUrls: product.images?.join(", ") || "",
    });
  };

  const handleDeleteProduct = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete product");
      }
      toast({
        title: "Product deleted",
        description: "The product has been removed.",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message || "Please check your admin permissions and try again.",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ orderStatus: status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update order status");
      }
      toast({
        title: "Order updated",
        description: `Order status updated to ${status}.`,
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating order",
        description: error.message || "Please check your admin permissions and try again.",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-secondary via-background to-white">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage products and monitor orders. All changes require admin authentication.
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Products management */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {editingProduct ? "Edit Product" : "Create New Product"}
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Premium Whey Protein"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: Number(e.target.value) || 0 })
                          }
                          placeholder="49.99"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({ ...form, stock: Number(e.target.value) || 0 })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={form.brand}
                          onChange={(e) => setForm({ ...form, brand: e.target.value })}
                          placeholder="Brand name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={form.category || ""}
                          onValueChange={(value) => setForm({ ...form, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.slug} value={c.name}>
                                {c.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="images">Image URLs</Label>
                      <Textarea
                        id="images"
                        value={form.imageUrls}
                        onChange={(e) => handleImageUrlsChange(e.target.value)}
                        placeholder="Enter image URLs separated by commas or new lines"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple URLs with commas or new lines
                      </p>
                      {form.images && form.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`Preview ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="flavours">Flavours</Label>
                      <Textarea
                        id="flavours"
                        value={(form.flavours || []).join(", ")}
                        onChange={(e) => handleFlavoursChange(e.target.value)}
                        placeholder="Enter flavours separated by commas or new lines"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple flavours with commas or new lines
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitProduct} className="flex-1">
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            setForm({
                              name: "",
                              price: 0,
                              brand: "",
                              category: "",
                              description: "",
                              stock: 0,
                              images: [],
                              flavours: [],
                              imageUrls: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold">
                    All Products {loadingProducts && "(loading...)"}
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-auto border rounded-md p-2 bg-card">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-start gap-3 border-b last:border-b-0 pb-3 pt-2"
                      >
                        {p.images && p.images.length > 0 && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        )}
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatINR(p.price)} · {p.brand || "No brand"} · Stock: {p.stock ?? 0}
                          </p>
                          {p.category && (
                            <Badge variant="outline" className="text-xs">
                              {p.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(p)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!products.length && !loadingProducts && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No products found. Create your first product above.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders management */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor and update order statuses. Click on status to change it.
                </p>
                <div className="space-y-3 max-h-[600px] overflow-auto border rounded-md p-2 bg-card">
                  {loadingOrders && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Loading orders...
                    </p>
                  )}
                  {!loadingOrders &&
                    Array.isArray(orders) &&
                    orders.map((order) => {
                      const status = order.orderStatus || order.status || "pending";
                      const total = order.totalAmount || order.totalPrice || 0;
                      const user = order.user || order.userId;
                      const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "";

                      return (
                        <div
                          key={order._id}
                          className="flex flex-col gap-2 border-b last:border-b-0 pb-3 pt-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <p className="font-medium text-sm">
                                  Order #{order._id.slice(-8).toUpperCase()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span className="truncate">
                                  {user?.fullName || user?.email || "Guest"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatINR(total)}</span>
                                {order.items && order.items.length > 0 && (
                                  <span>· {order.items.length} item(s)</span>
                                )}
                              </div>
                              {orderDate && (
                                <p className="text-xs text-muted-foreground">
                                  {orderDate}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Select
                                value={status}
                                onValueChange={(value) =>
                                  handleUpdateOrderStatus(order._id, value)
                                }
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                                title={status}
                              />
                            </div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="text-xs text-muted-foreground pl-6">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx}>
                                  {item.name || "Item"} × {item.quantity || 1}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div>+{order.items.length - 2} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {!loadingOrders && (!Array.isArray(orders) || !orders.length) && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No orders found yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
