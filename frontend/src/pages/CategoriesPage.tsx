import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Zap, ShieldCheck, HeartPulse, Beef, Pill } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoriesPage = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: "Whey Proteins", description: "High-quality protein supplements", icon: Dumbbell, products: 45, color: "text-primary" },
    { id: 2, name: "Pre-workout", description: "Energy and performance boosters", icon: Zap, products: 32, color: "text-accent" },
    { id: 3, name: "Vitamins & Minerals", description: "Essential daily nutrients", icon: ShieldCheck, products: 78, color: "text-primary" },
    { id: 4, name: "Post-workout", description: "Recovery and muscle repair", icon: HeartPulse, products: 28, color: "text-accent" },
    { id: 5, name: "Mass Gainers", description: "Build muscle and gain weight", icon: Beef, products: 23, color: "text-primary" },
    { id: 6, name: "Health & Wellness", description: "General health supplements", icon: Pill, products: 56, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our complete range of premium supplements organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-primary/10 ${category.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground mb-3">{category.description}</p>
                    <p className="text-sm text-muted-foreground mb-4">{category.products} Products</p>
                    <Button onClick={() => navigate(`/category/${category.id}`)}>
                      Browse Category
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
