import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  category: string;
}

const ProductCard = ({ 
  name, 
  price, 
  originalPrice, 
  rating, 
  reviews, 
  image, 
  badge,
  category 
}: ProductCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-product transition-all duration-300 transform hover:-translate-y-2 group">
      {/* Product Image */}
      <div className="relative mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover rounded-xl bg-gradient-product"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
            {badge}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-card/80 hover:bg-card shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {category}
          </p>
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(rating) 
                    ? 'fill-accent text-accent' 
                    : 'text-muted-foreground/30'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating} ({reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">{price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-gradient-cta hover:shadow-lg transform hover:scale-105 transition-all"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;