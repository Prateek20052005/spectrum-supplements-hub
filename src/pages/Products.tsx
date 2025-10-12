import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const products = [
    { id: 1, name: "Premium Whey Protein", price: "$49.99", rating: 4.8, reviews: 128, image: "/placeholder.svg", badge: "Best Seller", category: "Protein" },
    { id: 2, name: "Creatine Monohydrate", price: "$29.99", rating: 4.9, reviews: 95, image: "/placeholder.svg", category: "Creatine" },
    { id: 3, name: "Pre-Workout Energy", price: "$39.99", rating: 4.7, reviews: 76, image: "/placeholder.svg", badge: "New", category: "Pre-Workout" },
    { id: 4, name: "BCAA Recovery", price: "$34.99", rating: 4.6, reviews: 54, image: "/placeholder.svg", category: "Recovery" },
    { id: 5, name: "Mass Gainer", price: "$59.99", rating: 4.5, reviews: 43, image: "/placeholder.svg", category: "Mass Gainer" },
    { id: 6, name: "Multivitamin Complex", price: "$24.99", rating: 4.8, reviews: 112, image: "/placeholder.svg", category: "Vitamins" },
    { id: 7, name: "Omega-3 Fish Oil", price: "$19.99", rating: 4.7, reviews: 89, image: "/placeholder.svg", category: "Vitamins" },
    { id: 8, name: "Vitamin D3", price: "$14.99", rating: 4.9, reviews: 134, image: "/placeholder.svg", category: "Vitamins" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-96"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
