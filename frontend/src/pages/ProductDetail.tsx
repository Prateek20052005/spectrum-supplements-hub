import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/utils/currency";
import { useCart } from "@/contexts/CartContext";

type Product = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  brand?: string;
  category?: string;
  description?: string;
  images?: string[];
  stock?: number;
  rating?: number;
  flavours?: string[];
  reviews?: Array<{
    userId?: string;
    fullName?: string;
    comment?: string;
    rating?: number;
    date?: string;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedFlavour, setSelectedFlavour] = useState<string | null>(null);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const { cart, getItemQuantity, setItemQuantity, removeItem } = useCart();

  const token = useMemo(() => {
    try {
      const userInfoRaw = localStorage.getItem("userInfo");
      if (!userInfoRaw) return null;
      const userInfo = JSON.parse(userInfoRaw);
      return userInfo?.token || null;
    } catch {
      return null;
    }
  }, []);

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
        // Set the first flavour as selected if available
        const fs = (data?.flavours || []).filter(Boolean);
        setSelectedFlavour(fs.length > 0 ? fs[0] : null);
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
  }, [id, toast]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?._id]);

  useEffect(() => {
    const fetchCanReview = async () => {
      if (!id || !token) {
        setCanReview(false);
        setReviewReason(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}/can-review`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setCanReview(false);
          setReviewReason(null);
          return;
        }
        setCanReview(!!data?.canReview);
        setReviewReason(data?.reason || null);
      } catch {
        setCanReview(false);
        setReviewReason(null);
      }
    };

    fetchCanReview();
  }, [id, token]);

  const cartMatch = useMemo(() => {
    if (!product?._id) return null;
    const items = cart?.items || [];
    return (
      items.find((i: any) => {
        const pid = (i.productId && typeof i.productId === "object") ? i.productId._id : i.productId;
        return String(pid) === String(product._id);
      }) || null
    );
  }, [cart, product?._id]);

  useEffect(() => {
    if (!cartMatch?.flavour) return;
    if (selectedFlavour === null || String(selectedFlavour) !== String(cartMatch.flavour)) {
      setSelectedFlavour(cartMatch.flavour);
    }
  }, [cartMatch?.flavour, selectedFlavour]);

  const qtyInCart = useMemo(() => {
    if (!product) return 0;
    if (cartMatch) return Number(cartMatch.quantity) || 0;
    return getItemQuantity(product._id, selectedFlavour);
  }, [product, cartMatch, selectedFlavour, getItemQuantity]);

  const handleAddToCart = async () => {
    if (!product) return;

    const availableFlavours = (product.flavours || []).filter(Boolean);
    if (availableFlavours.length > 0 && !selectedFlavour) {
      toast({
        variant: "destructive",
        title: "Select a flavour",
        description: "Please select a flavour before adding to cart.",
      });
      return;
    }

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
      await setItemQuantity(product._id, qtyInCart + 1, selectedFlavour);

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

  const handleIncrement = async () => {
    if (!product) return;
    try {
      setAdding(true);
      const useFlavour = (cartMatch?.flavour ?? selectedFlavour) || null;
      await setItemQuantity(product._id, qtyInCart + 1, useFlavour);
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
    if (!product) return;
    try {
      setAdding(true);
      const useFlavour = (cartMatch?.flavour ?? selectedFlavour) || null;
      const next = qtyInCart - 1;
      if (next <= 0) {
        await removeItem(product._id, useFlavour);
      } else {
        await setItemQuantity(product._id, next, useFlavour);
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

  const handleSubmitReview = async () => {
    if (!id || !token) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to leave a review.",
      });
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        variant: "destructive",
        title: "Missing review",
        description: "Please enter a review comment.",
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit review");
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setReviewComment("");

      const refreshed = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (refreshed.ok) {
        const p = await refreshed.json();
        setProduct(p);
      }

      const canRes = await fetch(`${API_BASE_URL}/api/products/${id}/can-review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const canData = await canRes.json().catch(() => null);
      if (canRes.ok) {
        setCanReview(!!canData?.canReview);
        setReviewReason(canData?.reason || null);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Review failed",
        description: error.message || "Could not submit review.",
      });
    } finally {
      setSubmittingReview(false);
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

  const images = (product.images || []).filter(Boolean);
  const imageUrl = images[selectedImageIndex] || "/placeholder.svg";
  const rating = product.rating || 0;
  const reviewCount = product.reviews?.length || 0;
  const flavours = (product.flavours || []).filter(Boolean);
  const sellingPrice = product.discountedPrice ?? product.price;
  const discountPercent = (() => {
    const o = product.originalPrice;
    const p = sellingPrice;
    if (!o || !p || o <= 0 || p <= 0 || p >= o) return null;
    return Math.floor(((o - p) / o) * 100);
  })();
  const reviewsSorted = [...(product.reviews || [])].sort((a, b) => {
    const da = a?.date ? new Date(a.date).getTime() : 0;
    const db = b?.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full rounded-lg shadow-lg mb-4"
            />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Image ${idx + 1}`}
                      className="w-20 h-20 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
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

            <div className="flex items-center gap-3 mb-6">
              <p className="text-3xl font-bold text-primary">
                {formatINR(sellingPrice)}
              </p>
              {product.originalPrice && product.originalPrice > sellingPrice && (
                <p className="text-muted-foreground line-through text-lg">
                  {formatINR(product.originalPrice)}
                </p>
              )}
              {discountPercent !== null && (
                <Badge className="ml-1" variant="secondary">
                  {discountPercent}% OFF
                </Badge>
              )}
            </div>

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
              {qtyInCart > 0 ? (
                <div className="flex-1 flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-12 px-0"
                    onClick={handleDecrement}
                    disabled={adding}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center font-semibold text-lg">{qtyInCart}</div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-12 px-0"
                    onClick={handleIncrement}
                    disabled={adding}
                  >
                    +
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={adding || (product.stock !== undefined && product.stock === 0)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {adding ? "Adding..." : "Add to Cart"}
                </Button>
              )}
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {flavours.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Flavours Available</h3>
                <div className="flex flex-wrap gap-2">
                  {flavours.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFlavour(f)}
                      className={`inline-flex transition-all ${
                        selectedFlavour === f 
                          ? 'ring-2 ring-offset-2 ring-primary scale-105' 
                          : 'opacity-80 hover:opacity-100 hover:ring-1 hover:ring-muted-foreground/30'
                      } rounded-full`}
                    >
                      <Badge 
                        variant={selectedFlavour === f ? 'default' : 'secondary'}
                        className="px-3 py-1.5 text-sm font-medium"
                      >
                        {f}
                      </Badge>
                    </button>
                  ))}
                </div>
                {selectedFlavour && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: <span className="text-foreground font-medium">{selectedFlavour}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviewsSorted.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviewsSorted.map((r, idx) => (
                  <div key={`${r.userId || "u"}-${idx}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{r.fullName || "Customer"}</p>
                        {r.date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(r.rating || 0)
                                ? "fill-accent text-accent"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
            {!token ? (
              <p className="text-muted-foreground">
                Please log in to write a review.
              </p>
            ) : canReview ? (
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Button
                        key={v}
                        type="button"
                        variant={reviewRating === v ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReviewRating(v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Comment</p>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {reviewReason === "already_reviewed"
                  ? "You have already reviewed this product."
                  : "You can review this product only after your order is delivered."}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
