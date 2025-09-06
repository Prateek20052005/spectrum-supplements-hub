import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import heroProduct1 from "@/assets/hero-product-1.jpg";
import heroProduct2 from "@/assets/hero-product-2.jpg";
import heroProduct3 from "@/assets/hero-product-3.jpg";

const Hero = () => {
  const products = [
    {
      id: 1,
      name: "Premium Whey Protein",
      price: "$59.99",
      originalPrice: "$79.99",
      rating: 4.8,
      reviews: 1247,
      image: heroProduct1,
      badge: "BEST SELLER"
    },
    {
      id: 2,
      name: "Energy Pre-Workout",
      price: "$39.99",
      originalPrice: "$49.99",
      rating: 4.9,
      reviews: 892,
      image: heroProduct2,
      badge: "NEW"
    },
    {
      id: 3,
      name: "Pure Creatine Monohydrate",
      price: "$24.99",
      originalPrice: "$34.99",
      rating: 4.7,
      reviews: 634,
      image: heroProduct3,
      badge: "SALE"
    }
  ];

  return (
    <section className="bg-gradient-product py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Fuel Your
                <span className="text-accent block">Beast Mode</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Premium supplements for serious athletes. Quality tested, results guaranteed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-cta hover:shadow-lg transform hover:scale-105 transition-all">
                Shop Best Sellers
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Products
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24h</div>
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative">
            <div className="grid gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-product transition-all duration-300 transform hover:-translate-y-2 ${
                    index === 0 ? 'lg:scale-110 lg:z-10' : 'lg:scale-95 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {product.badge}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-accent">{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-cta hover:shadow-lg">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;