import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/utils/currency";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: number | string;
  _id?: string;
  name: string;
  price: number | string;
  originalPrice?: number | string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  category: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const ProductCard = ({ 
  id,
  _id,
  name, 
  price, 
  originalPrice, 
  rating, 
  reviews, 
  image, 
  badge,
  category 
}: ProductCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [defaultFlavour, setDefaultFlavour] = useState<string | null>(null);
  const [loadingFlavour, setLoadingFlavour] = useState(false);
  const { cart, getItemQuantity, setItemQuantity, removeItem } = useCart();

  const hasOriginalPrice =
    originalPrice !== undefined && originalPrice !== null && `${originalPrice}`.length > 0;

  const discountPercent = (() => {
    if (!hasOriginalPrice) return null;
    const o = typeof originalPrice === "number" ? originalPrice : Number(originalPrice);
    const p = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(o) || !Number.isFinite(p) || o <= 0 || p <= 0 || p >= o) return null;
    return Math.floor(((o - p) / o) * 100);
  })();
  
  // Prioritize _id (MongoDB ObjectId) over id (numeric)
  const productId = _id || id;

  const handleOpenProduct = () => {
    if (!productId) {
      console.error('No valid product ID found:', { _id, id, productId });
      return;
    }
    navigate(`/product/${productId}`);
  };

  const ensureDefaultFlavour = async () => {
    if (!productId) return null;
    if (defaultFlavour !== null) return defaultFlavour;
    try {
      setLoadingFlavour(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);
      if (!res.ok) return null;
      const data = await res.json();
      const first = Array.isArray(data?.flavours) && data.flavours.length > 0 ? data.flavours[0] : null;
      setDefaultFlavour(first);
      return first;
    } finally {
      setLoadingFlavour(false);
    }
  };

  const cartMatch = useMemo(() => {
    if (!productId) return null;
    const items = cart?.items || [];
    return (
      items.find((i: any) => {
        const pid = (i.productId && typeof i.productId === "object") ? i.productId._id : i.productId;
        return String(pid) === String(productId);
      }) || null
    );
  }, [cart, productId]);

  const activeFlavour = useMemo(() => {
    return (cartMatch?.flavour ?? defaultFlavour) as string | null;
  }, [cartMatch, defaultFlavour]);

  const qtyInCart = useMemo(() => {
    if (!productId) return 0;
    if (cartMatch) return Number(cartMatch.quantity) || 0;
    return getItemQuantity(String(productId), activeFlavour);
  }, [productId, cartMatch, getItemQuantity, activeFlavour]);

  const handleAddToCart = async () => {
    try {
      const userInfoRaw = localStorage.getItem("userInfo");
      if (!userInfoRaw) {
        toast({
          variant: "destructive",
          title: "Please log in",
          description: "You need to be logged in to add items to your cart.",
        });
        navigate("/login");
        return;
      }

      const userInfo = JSON.parse(userInfoRaw);
      const token = userInfo?.token;
      if (!token) {
        toast({
          variant: "destructive",
          title: "Please log in",
          description: "You need to be logged in to add items to your cart.",
        });
        navigate("/login");
        return;
      }

      if (!productId) {
        toast({
          variant: "destructive",
          title: "Invalid product",
          description: "This product cannot be added to cart. Please refresh the page.",
        });
        return;
      }

      setAdding(true);

      const firstFlavour = await ensureDefaultFlavour();
      await setItemQuantity(String(productId), qtyInCart + 1, firstFlavour);

      const flavourText = firstFlavour ? ` (${firstFlavour})` : "";
      toast({
        title: "Added to cart",
        description: `${name}${flavourText} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding to cart",
        description: error.message || "Could not add item to cart.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = async () => {
    if (!productId) return;
    try {
      setAdding(true);
      const useFlavour = activeFlavour ?? (await ensureDefaultFlavour());
      await setItemQuantity(String(productId), qtyInCart + 1, useFlavour);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update quantity.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDecrement = async () => {
    if (!productId) return;
    try {
      setAdding(true);
      const firstFlavour = activeFlavour ?? (await ensureDefaultFlavour());
      const next = qtyInCart - 1;
      if (next <= 0) {
        await removeItem(String(productId), firstFlavour);
      } else {
        await setItemQuantity(String(productId), next, firstFlavour);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update quantity.",
      });
    } finally {
      setAdding(false);
    }
  };
  return (
    <div
      className="bg-card rounded-2xl p-6 shadow-card hover:shadow-product transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleOpenProduct}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenProduct();
        }
      }}
    >
      {/* Product Image */}
      <div className="relative mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover rounded-xl bg-gradient-product"
        />
        {discountPercent !== null ? (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
            {discountPercent}% OFF
          </span>
        ) : badge ? (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
            {badge}
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-card/80 hover:bg-card shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {category}
          </p>
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(rating) 
                    ? 'fill-accent text-accent' 
                    : 'text-muted-foreground/30'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating} ({reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary font-bold text-lg">{formatINR(price)}</div>
            {hasOriginalPrice && (
              <span className="text-muted-foreground line-through text-sm">{formatINR(originalPrice)}</span>
            )}
          </div>
        </div>

        {/* Add to Cart / Quantity Stepper */}
        {qtyInCart > 0 ? (
          <div className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-10 px-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDecrement();
              }}
              disabled={adding || loadingFlavour}
            >
              -
            </Button>
            <div className="flex-1 text-center font-semibold">{qtyInCart}</div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-10 px-0"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrement();
              }}
              disabled={adding || loadingFlavour}
            >
              +
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-gradient-cta hover:shadow-lg transform hover:scale-105 transition-all"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={adding || loadingFlavour}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;