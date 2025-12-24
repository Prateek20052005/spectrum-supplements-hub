import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

type CartItem = {
  productId: any;
  flavour?: string | null;
  quantity: number;
  name: string;
  price: number;
  image?: string;
};

type CartState = {
  items: any[];
};

type CartContextType = {
  cartCount: number;
  cart: CartState | null;
  refreshCart: () => Promise<void>;
  getItemQuantity: (productId: string, flavour?: string | null) => number;
  setItemQuantity: (productId: string, quantity: number, flavour?: string | null) => Promise<void>;
  removeItem: (productId: string, flavour?: string | null) => Promise<void>;
  updateCartCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<CartState | null>(null);
  const { toast } = useToast();

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

  const refreshCart = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setCartCount(0);
      setCart(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCart(data?.items ? data : { items: [] });
        const count = data?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  }, []);

  const updateCartCount = refreshCart;

  const getItemQuantity = useCallback((productId: string, flavour?: string | null) => {
    const items = cart?.items || [];
    const found = items.find((i: any) => {
      const pid = (i.productId && typeof i.productId === 'object') ? i.productId._id : i.productId;
      return String(pid) === String(productId) && String(i.flavour || "") === String(flavour || "");
    });
    return found?.quantity || 0;
  }, [cart]);

  const setItemQuantity = async (productId: string, quantity: number, flavour?: string | null) => {
    const headers = getAuthHeaders();
    if (!headers) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to update your cart.",
      });
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: "POST",
      headers,
      body: JSON.stringify({ productId, quantity, flavour: flavour || null }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to update cart");
    }

    await refreshCart();
  };

  const removeItem = async (productId: string, flavour?: string | null) => {
    const headers = getAuthHeaders();
    if (!headers) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to update your cart.",
      });
      return;
    }

    const flavourQuery = flavour ? `?flavour=${encodeURIComponent(flavour)}` : "";
    const res = await fetch(`${API_BASE_URL}/api/cart/${productId}${flavourQuery}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to remove item");
    }

    await refreshCart();
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cart,
        refreshCart,
        getItemQuantity,
        setItemQuantity,
        removeItem,
        updateCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
