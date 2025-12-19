import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { formatINR, formatNumberINR } from "@/utils/currency";

type CartItem = {
  productId: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    stock?: number;
  };
  flavour?: string | null;
  quantity: number;
};

type Cart = {
  items: CartItem[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const fetchCart = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            variant: "destructive",
            title: "Please log in",
            description: "You need to be logged in to view your cart.",
          });
          setCart(null);
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await res.json();
      setCart(data.items ? data : { items: [] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading cart",
        description: error.message || "Could not load your cart.",
      });
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number, flavour?: string | null) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setUpdating(productId);
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId, quantity: newQuantity, flavour: flavour || null }),
      });

      if (!res.ok) throw new Error('Failed to update quantity');

      await fetchCart();
      await updateCartCount();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update quantity.",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setUpdating(productId);
      const res = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) throw new Error('Failed to remove item');

      await fetchCart();
      await updateCartCount();
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove item from cart.",
      });
    } finally {
      setUpdating(null);
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.productId?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 500 : 0; // Flat ₹500 shipping
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.productId;
              const isUpdating = updating === product?._id;
              const imageUrl = product?.images?.[0] || "/placeholder.svg";

              return (
                <Card key={product?._id || Math.random()} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={imageUrl}
                      alt={product?.name || "Product"}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-primary font-bold mb-4">
                        {formatINR(product?.price || 0)}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(product?._id || "", item.quantity - 1, item.flavour)
                          }
                          disabled={isUpdating}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(product?._id || "", item.quantity + 1, item.flavour)
                          }
                          disabled={isUpdating || (product?.stock && item.quantity >= product.stock)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(product?._id || "")}
                        disabled={isUpdating}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <p className="font-bold">
                        {formatINR((product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
              })}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="mt-4 text-center">
                <Link 
                  to="/products" 
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
