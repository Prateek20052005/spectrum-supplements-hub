import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { slugToCategory } from "@/constants/categories";

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  rating?: number;
  reviews?: any[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const CategoryView = () => {
  const { id } = useParams();

  const category = useMemo(() => slugToCategory(id), [id]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    return products.filter((p) => (p.category || "").toLowerCase() === category.name.toLowerCase());
  }, [products, category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">{category?.name || "Category"}</h1>
        <p className="text-muted-foreground mb-8">{category?.description || "Browse products"}</p>

        {loading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : !category ? (
          <p className="text-muted-foreground">Category not found.</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-muted-foreground">No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                rating={product.rating || 0}
                reviews={product.reviews?.length || 0}
                image={product.images?.[0] || "/placeholder.svg"}
                category={product.category || "Uncategorized"}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryView;
