import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { formatINR } from "@/utils/currency";

type HeroProduct = {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  images?: string[];
  rating?: number;
  reviews?: any[];
};

type HeroProps = {
  products: HeroProduct[];
  loading?: boolean;
  error?: string | null;
};

const Hero = ({ products, loading, error }: HeroProps) => {
  const top = (products || []).slice(0, 3);
  const bannerUrl = "/ksn-banner.jpg";

  return (
    <section className="relative py-16 lg:py-20">
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      />
      <div className="absolute inset-0 bg-background/55" />
      <div className="container mx-auto px-4 relative">
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
              {loading ? (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="text-sm text-muted-foreground">Loading products...</div>
                </div>
              ) : error ? (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="text-sm text-muted-foreground">{error}</div>
                </div>
              ) : (
                top.map((product, index) => {
                  const image = product.images?.[0] || "/placeholder.svg";
                  const rating = product.rating || 0;
                  const reviewCount = product.reviews?.length || 0;
                  const price = product.discountedPrice ?? product.price;
                  const original = product.originalPrice;
                  return (
                    <div
                      key={product._id}
                      className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-product transition-all duration-300 transform hover:-translate-y-2 ${
                        index === 0 ? "lg:scale-110 lg:z-10" : "lg:scale-95 opacity-90"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(rating)
                                      ? "fill-accent text-accent"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">
                                {rating} ({reviewCount})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-accent">{formatINR(price)}</span>
                            {original && original > price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatINR(original)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" className="bg-gradient-cta hover:shadow-lg">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
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