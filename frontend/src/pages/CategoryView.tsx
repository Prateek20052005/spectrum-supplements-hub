import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const CategoryView = () => {
  const { id } = useParams();

  const products = [
    { id: 1, name: "Premium Whey Protein", price: "$49.99", rating: 4.8, reviews: 128, image: "/placeholder.svg", category: "Whey Protein" },
    { id: 2, name: "Isolate Whey Protein", price: "$59.99", rating: 4.9, reviews: 95, image: "/placeholder.svg", category: "Whey Protein" },
    { id: 3, name: "Whey Protein Blend", price: "$44.99", rating: 4.7, reviews: 76, image: "/placeholder.svg", category: "Whey Protein" },
    { id: 4, name: "Grass-Fed Whey", price: "$54.99", rating: 4.8, reviews: 103, image: "/placeholder.svg", category: "Whey Protein" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Whey Proteins</h1>
        <p className="text-muted-foreground mb-8">High-quality protein supplements for muscle building and recovery</p>

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

export default CategoryView;
