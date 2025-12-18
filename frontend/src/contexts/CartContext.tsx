import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
};

type CartContextType = {
  cartCount: number;
  updateCartCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
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

  const updateCartCount = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, { headers });
      if (res.ok) {
        const data = await res.json();
        const count = data?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
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
