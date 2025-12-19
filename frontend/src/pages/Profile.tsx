import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Package, Clock4, LogOut, LogIn, ShieldCheck, Truck, CheckCircle } from "lucide-react";
import { type Order, type OrderStatus } from "@/types/order";
import { formatINR } from "@/utils/currency";

type UserProfile = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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

  const fetchOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/myorders`, {
        headers,
      });

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUserProfile = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers,
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      await Promise.all([fetchUserProfile(), fetchOrders()]);
      setLoading(false);
    };

    initializeProfile();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "placed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "placed":
        return <Clock4 className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email;
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]?.toUpperCase() || ""}${parts[1][0]?.toUpperCase() || ""}`;
  }, [user?.fullName, user?.email]);

  const currentOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled");
  }, [orders]);

  const orderHistory = useMemo(() => {
    return orders.filter((o) => o.orderStatus === "delivered" || o.orderStatus === "cancelled");
  }, [orders]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="bg-gradient-to-br from-secondary via-background to-white">
          <div className="container mx-auto px-4 py-12 flex justify-center">
            <Card className="w-full max-w-2xl shadow-hero bg-card text-card-foreground">
              <CardHeader className="space-y-2 text-center">
                <Badge className="mx-auto w-fit" variant="secondary">
                  Profile
                </Badge>
                <CardTitle className="text-3xl font-semibold">You&apos;re not signed in</CardTitle>
                <p className="text-muted-foreground">
                  Access your orders, saved details, and personalized recommendations by signing in
                  or creating an account.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={() => navigate("/login")} className="gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign in
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                  Create account
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="bg-gradient-to-br from-secondary via-background to-white">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="shadow-card lg:col-span-1">
              <CardHeader className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back</p>
                    <CardTitle className="text-2xl">{user.fullName || "Guest"}</CardTitle>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    Active
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Secure account
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{user.email || "Email not added yet"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{user.phone || "Phone not added yet"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{user.address || "Add your shipping address"}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Current orders</CardTitle>
                    <p className="text-sm text-muted-foreground">Track what&apos;s on the way</p>
                  </div>
                  <Badge variant="secondary">{currentOrders.length} active</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  ) : currentOrders.length ? (
                    currentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => navigate(`/order/${order._id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigate(`/order/${order._id}`);
                          }
                        }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-semibold">#{order._id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatINR(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <Badge variant="outline" className="capitalize">
                              {order.orderStatus}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock4 className="h-4 w-4" />
                              <span>Placed on {formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No active orders right now.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order history</CardTitle>
                    <p className="text-sm text-muted-foreground">Past purchases and receipts</p>
                  </div>
                  <Badge variant="outline">{orderHistory.length} completed</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  ) : orderHistory.length ? (
                    orderHistory.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => navigate(`/order/${order._id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigate(`/order/${order._id}`);
                          }
                        }}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">#{order._id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatINR(order.totalAmount)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="secondary" className="capitalize">
                            {order.orderStatus}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No previous orders yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
