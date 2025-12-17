import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type Product = {
  _id?: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  stock?: number;
};

type Order = {
  _id: string;
  user?: { name?: string; email?: string };
  totalPrice?: number;
  status?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Admin = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>({
    name: "",
    price: 0,
    brand: "",
    category: "",
    stock: 0,
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
      setProducts(data || []);
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

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(form),
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
        stock: 0,
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
        stock: product.stock || 0,
      });
  };

  const handleDeleteProduct = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

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
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update order status");
      }
      toast({
        title: "Order updated",
        description: `Order status set to ${status}.`,
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
              Manage products and monitor orders. Note: actions that change data require an admin token
              (user with role \"admin\" logged in).
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Products management */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    {editingProduct ? "Edit product" : "Create new product"}
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Product name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: Number(e.target.value) || 0 })
                        }
                        placeholder="49.99"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="Brand"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Category"
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
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitProduct}>
                        {editingProduct ? "Update product" : "Create product"}
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
                              countInStock: 0,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">
                    All products {loadingProducts && "(loading...)"}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-auto border rounded-md p-2 bg-card">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between gap-2 border-b last:border-b-0 pb-2"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${p.price} · {p.brand || "No brand"} · Stock:{" "}
                            {p.stock ?? "n/a"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(p)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!products.length && (
                      <p className="text-xs text-muted-foreground">
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
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Update the status of customer orders.
                </p>
                <div className="space-y-2 max-h-96 overflow-auto border rounded-md p-2 bg-card">
                  {loadingOrders && (
                    <p className="text-xs text-muted-foreground">Loading orders...</p>
                  )}
                  {!loadingOrders &&
                    Array.isArray(orders) &&
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex flex-col gap-1 border-b last:border-b-0 pb-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              Order {order._id.slice(-6)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.user?.name || order.user?.email || "Customer"} · Total: $
                              {order.totalPrice ?? "n/a"}
                            </p>
                          </div>
                          <Select
                            defaultValue={order.status || "pending"}
                            onValueChange={(value) =>
                              handleUpdateOrderStatus(order._id, value)
                            }
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  {!loadingOrders && (!Array.isArray(orders) || !orders.length) && (
                    <p className="text-xs text-muted-foreground">
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


