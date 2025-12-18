import ProductCard from "./ProductCard";
import heroProduct1 from "@/assets/hero-product-1.jpg";
import heroProduct2 from "@/assets/hero-product-2.jpg";
import heroProduct3 from "@/assets/hero-product-3.jpg";

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Gold Standard 100% Whey",
      price: 5999,
      originalPrice: 7999,
      rating: 4.8,
      reviews: 1247,
      image: heroProduct1,
      badge: "BEST SELLER",
      category: "Whey Protein"
    },
    {
      id: 2,
      name: "C4 Original Pre-Workout",
      price: 3999,
      originalPrice: 4999,
      rating: 4.9,
      reviews: 892,
      image: heroProduct2,
      badge: "NEW",
      category: "Pre-Workout"
    },
    {
      id: 3,
      name: "Micronized Creatine",
      price: 2499,
      originalPrice: 3499,
      rating: 4.7,
      reviews: 634,
      image: heroProduct3,
      badge: "SALE",
      category: "Creatine"
    },
    {
      id: 4,
      name: "Platinum Whey Isolate",
      price: 6999,
      originalPrice: 8999,
      rating: 4.9,
      reviews: 523,
      image: heroProduct1,
      category: "Whey Protein"
    },
    {
      id: 5,
      name: "Extreme Energy Booster",
      price: 4499,
      rating: 4.6,
      reviews: 387,
      image: heroProduct2,
      badge: "LIMITED",
      category: "Pre-Workout"
    },
    {
      id: 6,
      name: "Pure Creatine HCl",
      price: 2999,
      originalPrice: 3999,
      rating: 4.8,
      reviews: 298,
      image: heroProduct3,
      category: "Creatine"
    }
  ];

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
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;