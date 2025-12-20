import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, MapPin, Package, Clock4, LogOut, LogIn, Edit, ChevronDown } from "lucide-react";
import EditProfileForm from "@/components/EditProfileForm";
import { type Order as ApiOrder } from "@/types/order";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  role?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getAuthHeaders = useCallback(() => {
    try {
      const userInfoRaw = localStorage.getItem("userInfo");
      if (!userInfoRaw) return null;
      const userInfo = JSON.parse(userInfoRaw);
      const token = userInfo?.token;
      if (!token) return null;
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      } as const;
    } catch {
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(() => {
    try {
      setIsLoading(true);
      const saved = localStorage.getItem("userInfo");
      if (!saved) {
        setUser(null);
        return;
      }

      setUser(JSON.parse(saved));
    } catch {
      setUser(null);
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchOrders = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setOrders([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { headers });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load orders");
      }

      const list: ApiOrder[] = Array.isArray(data) ? data : data?.orders;
      setOrders(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setOrders([]);
      toast({
        title: "Error",
        description: e?.message || "Failed to load orders.",
        variant: "destructive",
      });
    }
  }, [getAuthHeaders, toast]);

  const handleUpdateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const nextUser: UserProfile = {
      ...(user ?? {}),
      ...data,
    };

    setUser(nextUser);
    localStorage.setItem("userInfo", JSON.stringify(nextUser));

    const headers = getAuthHeaders();
    if (headers) {
      try {
        await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });
      } catch {
        // ignore API failure; local profile still updates
      }
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  }, [toast, user]);

  const formattedAddress = useMemo(() => {
    const a = user?.address;
    if (a?.street) {
      const parts = [
        a.street,
        a.city,
        a.state,
        a.postalCode,
        a.country,
      ].filter(Boolean);
      return parts.join(", ");
    }
    return undefined;
  }, [user?.address]);

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email;
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0]?.toUpperCase() || ""}${parts[1][0]?.toUpperCase() || ""}`;
  }, [user?.fullName, user?.email]);

  const orderToSummary = useCallback((o: ApiOrder): OrderSummary => {
    const normalized = o.orderStatus ? o.orderStatus[0].toUpperCase() + o.orderStatus.slice(1) : "Placed";
    return {
      id: `ORD-${o._id.slice(-6).toUpperCase()}`,
      status: normalized,
      items: Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + (it.quantity || 0), 0) : 0,
      total: String(o.totalAmount),
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : undefined,
    };
  }, []);

  const canCancelOrder = useCallback((o: ApiOrder) => {
    const status = (o.orderStatus || "").toLowerCase();
    return !["shipped", "delivered", "cancelled"].includes(status);
  }, []);

  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      if (!window.confirm("Cancel this order? This is only possible before the order is shipped.")) return;
      const headers = getAuthHeaders();
      if (!headers) {
        navigate("/login", { state: { from: "/profile" } });
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
          method: "PUT",
          headers,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to cancel order");
        }
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
        toast({ title: "Order cancelled", description: "Your order has been cancelled." });
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to cancel order",
          variant: "destructive",
        });
      }
    },
    [getAuthHeaders, navigate, toast]
  );

  const currentOrders = useMemo(() => {
    const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.orderStatus));
    return active.map(orderToSummary);
  }, [orders, orderToSummary]);

  const orderHistory = useMemo(() => {
    const past = orders.filter((o) => ["delivered", "cancelled"].includes(o.orderStatus));
    return past.map(orderToSummary);
  }, [orders, orderToSummary]);

  const currentOrderList = useMemo(() => {
    return orders.filter((o) => !["delivered", "cancelled"].includes(o.orderStatus));
  }, [orders]);

  const orderHistoryList = useMemo(() => {
    return orders.filter((o) => ["delivered", "cancelled"].includes(o.orderStatus));
  }, [orders]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate('/login');
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch orders once authenticated
  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [fetchOrders, user]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Sign in to view your profile</CardTitle>
              <p className="text-muted-foreground">
                Access your orders, saved details, and personalized recommendations
              </p>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Create Account
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Main profile view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Left sidebar - Profile info */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-primary p-6 text-center text-white">
                <div className="mx-auto w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Avatar className="h-20 w-20 text-2xl">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <p className="text-sm opacity-80">{user.email}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 opacity-60" />
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="h-4 w-4 opacity-60 mt-0.5 flex-shrink-0" />
                  <span>{formattedAddress || 'No address saved'}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main content - Orders */}
          <div className="md:col-span-3 space-y-6">
            {/* Current Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Orders</CardTitle>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {currentOrders.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentOrderList.length ? (
                  currentOrderList.map((o) => {
                    const summary = orderToSummary(o);
                    const canCancel = canCancelOrder(o);
                    const addr = o.deliveryAddress;
                    const addrText = addr
                      ? [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")
                      : "No delivery address";

                    return (
                      <Collapsible key={o._id}>
                        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-semibold">{summary.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {summary.items} item{summary.items !== 1 ? "s" : ""} · {summary.total}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {summary.status}
                                </Badge>
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              {canCancel && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleCancelOrder(o._id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>

                          <CollapsibleContent className="pt-4">
                            <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
                                <p className="text-sm">{addrText}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Products</p>
                                <div className="space-y-1">
                                  {(o.items || []).map((it, idx) => (
                                    <div key={idx} className="text-sm flex flex-col gap-0.5">
                                      <div className="flex justify-between gap-4">
                                        <span className="truncate">{it.name || "Item"}</span>
                                        <span className="text-muted-foreground">× {it.quantity || 1}</span>
                                      </div>
                                      {it.flavour && (
                                        <div className="text-xs text-muted-foreground">
                                          Flavour: <span className="font-medium text-foreground">{it.flavour}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/order/${o._id}`)}>
                                  View full order
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No current orders</h3>
                    <p className="text-muted-foreground mt-1">Your active orders will appear here</p>
                    <Button className="mt-4" onClick={() => navigate('/products')}>
                      Start Shopping
                    </Button>
                  </div>
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
                {orderHistoryList.length ? (
                  orderHistoryList.map((o) => {
                    const summary = orderToSummary(o);
                    const addr = o.deliveryAddress;
                    const addrText = addr
                      ? [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")
                      : "No delivery address";

                    return (
                      <Collapsible key={o._id}>
                        <div className="rounded-lg border border-border bg-card px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="font-semibold">{summary.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {summary.items} item{summary.items !== 1 ? "s" : ""} · {summary.total}
                              </p>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="flex items-center justify-end gap-2">
                                <Badge variant="secondary" className="capitalize">
                                  {summary.status}
                                </Badge>
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <p className="text-xs text-muted-foreground">{summary.date || "Date unavailable"}</p>
                            </div>
                          </div>

                          <CollapsibleContent className="pt-4">
                            <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
                                <p className="text-sm">{addrText}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Products</p>
                                <div className="space-y-1">
                                  {(o.items || []).map((it, idx) => (
                                    <div key={idx} className="text-sm flex flex-col gap-0.5">
                                      <div className="flex justify-between gap-4">
                                        <span className="truncate">{it.name || "Item"}</span>
                                        <span className="text-muted-foreground">× {it.quantity || 1}</span>
                                      </div>
                                      {it.flavour && (
                                        <div className="text-xs text-muted-foreground">
                                          Flavour: <span className="font-medium text-foreground">{it.flavour}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/order/${o._id}`)}>
                                  View full order
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No order history</h3>
                    <p className="text-muted-foreground mt-1">Your completed orders will appear here</p>
                    <Button className="mt-4" onClick={() => navigate('/products')}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Edit Profile</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditing(false)}
                  className="text-muted-foreground"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EditProfileForm 
                user={{
                  fullName: user.fullName || "",
                  email: user.email || "",
                  phone: user.phone,
                  address: user.address || {
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "India",
                  },
                }} 
                onUpdate={async (data) => {
                  await handleUpdateProfile(data);
                  setIsEditing(false);
                }} 
                onCancel={() => setIsEditing(false)} 
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Profile;
