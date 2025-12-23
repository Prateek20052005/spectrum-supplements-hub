import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    <section className="relative py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366F1' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
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
              <Link to="/best-sellers">
                <Button size="lg" className="bg-gradient-cta hover:shadow-lg transform hover:scale-105 transition-all w-full sm:w-auto">
                  Shop Best Sellers
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                  View All Products
                </Button>
              </Link>
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

          {/* Right Content - KSN Banner */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-8 shadow-card overflow-hidden">
              <img
                src={bannerUrl}
                alt="KSN Banner"
                className="w-full h-auto object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;