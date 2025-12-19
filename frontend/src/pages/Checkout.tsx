import { useState, useEffect, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Package, CheckCircle, Smartphone } from "lucide-react";
import { formatINR } from "@/utils/currency";
import { type Order as ApiOrder, type CreateOrderRequest } from "@/types/order";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

type CheckoutOrder = {
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Checkout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showUpiPayment, setShowUpiPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);

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

  const fetchUserProfile = async (headers: HeadersInit) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, { headers });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        if (userData.shippingAddress) {
          setShippingAddress(userData.shippingAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const headers = getAuthHeaders();
    if (!headers) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchCartAndUser = async () => {
      const headers = getAuthHeaders();
      if (!headers) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to proceed to checkout.",
        });
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      try {
        setLoading(true);
        await Promise.all([
          fetchUserProfile(headers),
          fetchCart(headers)
        ]);
      } catch (error) {
        console.error('Error loading checkout data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load checkout data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndUser();
  }, [navigate, toast]);

  const fetchCart = async (headers: HeadersInit) => {
      if (!headers) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to proceed to checkout.",
        });
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/cart`, { headers });
        
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
          }
          throw new Error('Failed to fetch cart');
        }

        const cart = await res.json();
        if (!cart.items || cart.items.length === 0) {
          toast({
            title: "Your cart is empty",
            description: "Add some products to your cart before checking out.",
          });
          navigate('/cart');
          return;
        }

        // Calculate order summary
        const subtotal = cart.items.reduce((sum: number, item: any) => 
          sum + (item.productId.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 500 : 0;
        const tax = subtotal * 0.18;
        const total = subtotal + shipping + tax;

        setOrder({
          items: cart.items.map((item: any) => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            image: item.productId.images?.[0],
          })),
          subtotal,
          shipping,
          tax,
          total,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load your cart.",
        });
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };


  const handleSubmit = async (e?: SyntheticEvent) => {
    e?.preventDefault();
    if (!order) return;

    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // If user doesn't have a shipping address, validate the form
    if (!user?.shippingAddress) {
      const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof typeof shippingAddress]);
      
      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: `Please fill in all required shipping address fields.`,
        });
        return;
      }

      // Save shipping address to profile if requested
      if (saveShippingAddress && user) {
        const success = await updateUserProfile({ shippingAddress });
        if (!success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save shipping address. You can continue checkout, but the address won't be saved.",
          });
        }
      }
    }

    setProcessing(true);
    try {
      const orderData: CreateOrderRequest = {
        items: order.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: order.total,
        paymentMethod,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to place order');
      }

      const createdOrder: ApiOrder = await response.json();

      // Clear the cart
      await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers,
      });

      setOrderSuccess(true);
      
      // Show success message with order details
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${createdOrder._id.slice(-6)} has been placed. You will receive updates on your email.`,
      });

      // Redirect to order confirmation page after a short delay
      setTimeout(() => {
        navigate(`/profile`);
      }, 2000);
      
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasShippingAddress = !!user?.shippingAddress;

  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                View Orders
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Unable to load order details. Please try again.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">{user?.name || 'Not provided'}</p>
                      <p className="text-muted-foreground text-sm">{user?.email || 'No email'}</p>
                      {user?.phone && <p className="text-muted-foreground text-sm">{user.phone}</p>}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/profile')}
                    >
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Shipping Address</span>
                    {hasShippingAddress && (
                      <span className="text-sm font-normal text-green-600">
                        Saved
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasShippingAddress ? (
                    <div className="space-y-2">
                      <p className="font-medium">{user.shippingAddress.street}</p>
                      <p className="text-muted-foreground">
                        {user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.postalCode}
                      </p>
                      <p className="text-muted-foreground">{user.shippingAddress.country}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/profile')}
                        className="mt-2"
                      >
                        Update Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input 
                          id="street" 
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input 
                            id="city" 
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input 
                            id="state" 
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                            required 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input 
                            id="postalCode" 
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            value={shippingAddress.country}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="save-address"
                          checked={saveShippingAddress}
                          onChange={(e) => setSaveShippingAddress(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="save-address" className="text-sm text-muted-foreground">
                          Save this address for future orders
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        onClick={() => setPaymentMethod('upi')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1 rounded-full ${paymentMethod === 'upi' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Pay with UPI</Label>
                              {paymentMethod === 'upi' && (
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Recommended</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Fast and secure UPI payment
                            </p>
                          </div>
                          <RadioGroupItem
                            value="upi"
                            id="upi"
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 text-primary"
                          />
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1 rounded-full ${paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-base font-medium">Cash on Delivery</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pay when you receive your order
                            </p>
                          </div>
                          <RadioGroupItem
                            value="cod"
                            id="cod"
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 text-primary"
                          />
                        </div>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'upi' && (
                      <div className="p-4 border rounded-lg bg-muted/10">
                        {!showUpiPayment ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Complete your UPI Payment</h4>
                              <p className="text-sm text-muted-foreground">
                                You will be redirected to your UPI app to complete the payment of {formatINR(order.total)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() => {
                                const amount = Number(order.total).toFixed(2);
                                const upiUrl = `upi://pay?pa=your-merchant-vpa@upi&pn=Spectrum%20Supplies&am=${amount}&cu=INR&tn=Spectrum%20Supplies%20Order`;
                                window.location.href = upiUrl;
                              }}
                            >
                              Open UPI App
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              If your UPI app didn’t open, tap below.
                            </p>
                            <Button
                              type="button"
                              className="w-full"
                              onClick={() => {
                                const amount = Number(order.total).toFixed(2);
                                const upiUrl = `upi://pay?pa=your-merchant-vpa@upi&pn=Spectrum%20Supplies&am=${amount}&cu=INR&tn=Spectrum%20Supplies%20Order`;
                                window.location.href = upiUrl;
                              }}
                            >
                              Try Opening UPI Again
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => setShowUpiPayment(false)}
                            >
                              Back
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="p-4 border rounded-lg bg-muted/10">
                        <div className="flex items-start space-x-3">
                          <div className="p-1.5 rounded-full bg-primary/10 text-primary mt-0.5">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Pay with Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pay when you receive your order. No additional charges.
                            </p>
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                              <p className="text-sm text-yellow-700">
                                Please keep the exact amount ready for the delivery person.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    ))}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatINR(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{formatINR(order.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatINR(order.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span>{formatINR(order.total)}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
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

export default Checkout;
