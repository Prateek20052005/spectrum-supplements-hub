import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Package, Clock4, LogOut, LogIn, ShieldCheck } from "lucide-react";

type OrderSummary = {
  id: string;
  status: string;
  items: number;
  total: string;
  date?: string;
  eta?: string;
};

type UserProfile = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  currentOrders?: OrderSummary[];
  orderHistory?: OrderSummary[];
};

const sampleCurrentOrders: OrderSummary[] = [
  { id: "ORD-3012", status: "Preparing", items: 2, total: "₹7,200", eta: "Arrives in 2-3 days" },
  { id: "ORD-3005", status: "Shipped", items: 1, total: "₹3,500", eta: "On the way" },
];

const sampleOrderHistory: OrderSummary[] = [
  { id: "ORD-2988", status: "Delivered", items: 3, total: "₹10,000", date: "Nov 23, 2025" },
  { id: "ORD-2950", status: "Delivered", items: 1, total: "₹3,200", date: "Oct 10, 2025" },
];

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email;
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]?.toUpperCase() || ""}${parts[1][0]?.toUpperCase() || ""}`;
  }, [user?.fullName, user?.email]);

  const currentOrders = user?.currentOrders?.length ? user.currentOrders : sampleCurrentOrders;
  const orderHistory = user?.orderHistory?.length ? user.orderHistory : sampleOrderHistory;

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
                  {currentOrders.length ? (
                    currentOrders.map((order) => (
                      <div key={order.id} className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-semibold">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.items} item{order.items !== 1 ? "s" : ""} · {order.total}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <Badge
                              variant={order.status === "Delivered" ? "secondary" : "outline"}
                              className="capitalize"
                            >
                              {order.status}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock4 className="h-4 w-4" />
                              <span>{order.eta || "Delivery details coming soon"}</span>
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
                  {orderHistory.length ? (
                    orderHistory.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items} item{order.items !== 1 ? "s" : ""} · {order.total}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="secondary" className="capitalize">
                            {order.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{order.date || "Date unavailable"}</p>
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
