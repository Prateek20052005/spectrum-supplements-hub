import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

type Product = {
  _id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  description?: string;
  images?: string[];
  stock?: number;
  rating?: number;
  reviews?: any[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading product",
          description: error.message || "Could not load product details.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

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

      setAdding(true);
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to add to cart");
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">Product not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.images?.[0] || "/placeholder.svg";
  const rating = product.rating || 0;
  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div>
            {product.category && (
              <Badge className="mb-4">{product.category}</Badge>
            )}
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  ({rating} / {reviewCount} reviews)
                </span>
              </div>
            )}

            <p className="text-3xl font-bold text-primary mb-6">
              ${product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {product.brand && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Brand:</h3>
                <p className="text-muted-foreground">{product.brand}</p>
              </div>
            )}

            {product.stock !== undefined && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {product.stock > 0
                    ? `In stock (${product.stock} available)`
                    : "Out of stock"}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={adding || (product.stock !== undefined && product.stock === 0)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
