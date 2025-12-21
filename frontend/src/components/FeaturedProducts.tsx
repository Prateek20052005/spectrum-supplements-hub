import ProductCard from "./ProductCard";

type FeaturedProduct = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  rating?: number;
  reviews?: any[];
  images?: string[];
  category?: string;
};

type FeaturedProductsProps = {
  products: FeaturedProduct[];
  loading?: boolean;
  error?: string | null;
};

const FeaturedProducts = ({ products, loading, error }: FeaturedProductsProps) => {
  const featuredProducts = (products || []).slice(0, 6);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our top-rated supplements trusted by athletes worldwide
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading products...</div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">{error}</div>
          ) : (
            featuredProducts.map((product) => (
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
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;