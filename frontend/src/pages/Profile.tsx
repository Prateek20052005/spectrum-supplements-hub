import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Package, Clock4, LogOut, LogIn, ShieldCheck, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EditProfileForm from "@/components/EditProfileForm";

type OrderSummary = {
  id: string;
  status: string;
  items: number;
  total: string;
  date?: string;
  eta?: string;
};

type UserProfile = {
  _id?: string;
  fullName: string;
  email: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  
  // Get user initials for avatar
  const initials = useMemo(() => {
    if (!user) return "";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);
  
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const saved = localStorage.getItem("userInfo");
      if (!saved) {
        setUser(null);
        return;
      }
      
      const userInfo = JSON.parse(saved);
      const token = userInfo?.token;
      
      if (!token) {
        setUser(null);
        return;
      }
      
      // Make API call to get user profile
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, log the user out
          localStorage.removeItem("userInfo");
          setUser(null);
          return;
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      
      // Update the user state with the fetched data
      setUser({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        currentOrders: sampleCurrentOrders, // These would come from orders API in a real app
        orderHistory: sampleOrderHistory    // These would come from orders API in a real app
      });
      
      // Update the stored user info with the latest data
      const updatedUserInfo = {
        ...userInfo,
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
      };
      
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile information.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    try {
      const saved = localStorage.getItem("userInfo");
      if (!saved) throw new Error("User not authenticated");
      
      const userInfo = JSON.parse(saved);
      const token = userInfo?.token;
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Make API call to update user profile
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUserData = await response.json();
      
      // Update local state with the updated user data
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUserData,
        phone: updatedUserData.phone || prevUser?.phone,
        address: updatedUserData.address || prevUser?.address,
      }));
      
      // Update stored user info in localStorage
      const updatedUserInfo = {
        ...userInfo,
        name: updatedUserData.fullName,
        email: updatedUserData.email,
        phone: updatedUserData.phone || userInfo.phone,
        address: updatedUserData.address || userInfo.address,
      };
      
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return updatedUserData;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update profile',
      });
      throw error;
    }
  };
  
  // Handle user logout
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
                <CardContent>
                  <div className="space-y-4">
                    {user.currentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Order #{order.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.items} {order.items === 1 ? 'item' : 'items'} • {order.total}
                            </p>
                            {order.eta && (
                              <div className="flex items-center mt-2 text-sm">
                                <Clock4 className="h-4 w-4 mr-2 text-amber-500" />
                                <span>{order.eta}</span>
                              </div>
                            )}
                          </div>
                          <Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {user.orderHistory && user.orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {user.orderHistory.map((order) => (
                      <div key={order.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Order #{order.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.date} • {order.items} {order.items === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{order.total}</p>
                            <Badge variant={order.status === 'Delivered' ? 'default' : 'outline'} className="mt-1">
                              {order.status}
                            </Badge>
                          </div>
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
