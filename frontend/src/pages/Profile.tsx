import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  role?: string;
};

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
    navigate('/login');
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
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
                  <span>{user.address || 'No address saved'}</span>
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
            {user.currentOrders && user.currentOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Orders</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {user.currentOrders.length} Active
                    </Badge>
                  </div>
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
                    ))}
                  </div>
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
                    ))}
                  </div>
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
                user={user} 
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
