import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/constants/categories";

type Product = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  category?: string;
  images?: string[];
  rating?: number;
  reviews?: any[];
  sales?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState<{ [category: string]: Product[] }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    // Group products by category and sort by sales/rating to get best sellers
    const categoryBestSellers: { [category: string]: Product[] } = {};
    
    // Get unique categories from products
    const productCategories = [...new Set(products.map(p => p.category || "Uncategorized"))];
    
    productCategories.forEach(category => {
      const categoryProducts = products.filter(p => 
        (p.category || "Uncategorized") === category
      );
      
      // Sort by rating first, then by price (assuming higher priced items might be more popular)
      // In a real app, you'd sort by actual sales data
      const sortedProducts = categoryProducts.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviews?.length || 0) - (a.reviews?.length || 0);
      });
      
      // Take top 3-4 products from each category
      categoryBestSellers[category] = sortedProducts.slice(0, 4);
    });

    setBestSellers(categoryBestSellers);
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Best Sellers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our top-rated and most popular products from every category. 
            These are the supplements trusted by athletes and fitness enthusiasts nationwide.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading best sellers...</p>
          </div>
        ) : Object.keys(bestSellers).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No best sellers found.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(bestSellers).map(([category, categoryProducts]) => (
              <div key={category} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {category}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {categoryProducts.length} top products
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      _id={product._id}
                      id={product._id}
                      name={product.name}
                      price={product.discountedPrice ?? product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating || 0}
                      reviews={product.reviews?.length || 0}
                      image={product.images?.[0] || "/placeholder.svg"}
                      category={product.category || "Uncategorized"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BestSellers;
