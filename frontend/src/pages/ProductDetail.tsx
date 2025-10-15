import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img
              src="/placeholder.svg"
              alt="Product"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div>
            <Badge className="mb-4">Best Seller</Badge>
            <h1 className="text-4xl font-bold mb-4">Premium Whey Protein</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-muted-foreground">(4.8 / 128 reviews)</span>
            </div>

            <p className="text-3xl font-bold text-primary mb-6">$49.99</p>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our Premium Whey Protein delivers 25g of high-quality protein per serving. 
              Perfect for muscle building, recovery, and meeting your daily protein needs. 
              Available in delicious chocolate and vanilla flavors.
            </p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Key Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>25g protein per serving</li>
                <li>Fast absorption</li>
                <li>Supports muscle growth</li>
                <li>Great taste</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
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
