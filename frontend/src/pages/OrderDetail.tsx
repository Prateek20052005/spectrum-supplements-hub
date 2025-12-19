import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/utils/currency";
import { type Order } from "@/types/order";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const getAuthHeaders = () => {
    try {
      const userInfoRaw = localStorage.getItem("userInfo");
      if (!userInfoRaw) return null;
      const userInfo = JSON.parse(userInfoRaw);
      const token = userInfo?.token;
      if (!token) return null;
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const headers = getAuthHeaders();
      if (!headers) {
        navigate("/login", { state: { from: `/order/${id}` } });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers,
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load order");
        }

        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const canCancel = !!order && !["shipped", "delivered", "cancelled"].includes(order.orderStatus);

  const handleCancelOrder = async () => {
    if (!id) return;
    if (!canCancel) return;
    if (!window.confirm("Cancel this order? This is only possible before the order is shipped.")) return;

    const headers = getAuthHeaders();
    if (!headers) {
      navigate("/login", { state: { from: `/order/${id}` } });
      return;
    }

    try {
      setCancelling(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
        method: "PUT",
        headers,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to cancel order");
      }

      setOrder(data);
    } catch (e: any) {
      setError(e?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="bg-gradient-to-br from-secondary via-background to-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">Order Details</h1>
                {order?._id && (
                  <p className="text-sm text-muted-foreground">Order #{order._id.slice(-6)}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate("/profile")}>Back to Profile</Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Loading order...
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : !order ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Order not found.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Status</span>
                      <Badge variant="outline" className="capitalize">
                        {order.orderStatus}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <div className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
                      You can cancel this order only if it has not been shipped yet.
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment method</span>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment status</span>
                      <span className="capitalize">{order.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">{formatINR(order.totalAmount)}</span>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        disabled={!canCancel || cancelling}
                        onClick={handleCancelOrder}
                      >
                        {cancelling ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.items?.length ? (
                      order.items.map((it, idx) => (
                        <div key={`${it.productId}-${idx}`} className="flex items-center justify-between rounded-md border px-4 py-3">
                          <div>
                            <p className="font-medium">{it.name || "Product"}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {it.quantity}
                              {typeof it.price === "number" ? ` · ${formatINR(it.price)}` : ""}
                            </p>
                          </div>
                          <div className="font-semibold">
                            {typeof it.price === "number" ? formatINR(it.price * it.quantity) : ""}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No items found.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
