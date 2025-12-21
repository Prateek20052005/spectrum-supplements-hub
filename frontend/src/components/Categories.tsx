import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/constants/categories";

const Categories = () => {
  const navigate = useNavigate();

  const categories = (CATEGORIES || []).map((c, idx) => {
    const colors = [
      "bg-gradient-to-br from-blue-500/15 to-blue-600/25",
      "bg-gradient-to-br from-orange-500/15 to-red-600/25",
      "bg-gradient-to-br from-emerald-500/15 to-emerald-600/25",
      "bg-gradient-to-br from-purple-500/15 to-purple-600/25",
      "bg-gradient-to-br from-indigo-500/15 to-indigo-600/25",
      "bg-gradient-to-br from-yellow-500/15 to-orange-500/25",
    ];
    const icons = ["💪", "⚡", "🧬", "🏋️", "❤️", "🌟"];

    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      color: colors[idx % colors.length],
      icon: icons[idx % icons.length],
    };
  });

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
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/category/${category.slug}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/category/${category.slug}`);
                }
              }}
            >
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground">
                  {category.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-accent/20 hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/category/${category.slug}`);
                  }}
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