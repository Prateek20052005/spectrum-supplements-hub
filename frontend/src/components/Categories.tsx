import { Button } from "@/components/ui/button";

const Categories = () => {
  const categories = [
    {
      name: "Whey Proteins",
      description: "Premium protein powders for muscle growth",
      productCount: "150+ products",
      color: "bg-gradient-to-br from-blue-500/20 to-blue-600/30",
      icon: "💪"
    },
    {
      name: "Pre-Workout",
      description: "Energy boosters for peak performance",
      productCount: "85+ products",
      color: "bg-gradient-to-br from-orange-500/20 to-red-600/30",
      icon: "⚡"
    },
    {
      name: "Creatine",
      description: "Pure creatine for strength & power",
      productCount: "45+ products",
      color: "bg-gradient-to-br from-green-500/20 to-green-600/30",
      icon: "🏋️"
    },
    {
      name: "Vitamins",
      description: "Essential nutrients for health",
      productCount: "200+ products",
      color: "bg-gradient-to-br from-yellow-500/20 to-orange-500/30",
      icon: "🌟"
    },
    {
      name: "Amino Acids",
      description: "Building blocks for recovery",
      productCount: "65+ products",
      color: "bg-gradient-to-br from-purple-500/20 to-purple-600/30",
      icon: "🧬"
    },
    {
      name: "Mass Gainers",
      description: "Bulk up with quality calories",
      productCount: "40+ products",
      color: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/30",
      icon: "📈"
    }
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect supplements for your fitness goals
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`${category.color} rounded-2xl p-8 border border-border/50 hover:shadow-card transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group`}
            >
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground">
                  {category.description}
                </p>
                <p className="text-sm font-medium text-accent">
                  {category.productCount}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-accent/20 hover:bg-accent hover:text-accent-foreground"
                >
                  Browse {category.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-cta hover:shadow-lg">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Categories;