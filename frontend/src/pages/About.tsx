import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Award, Users, Heart, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
          
          <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
            We're dedicated to providing the highest quality supplements to help you achieve your fitness goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg bg-card border">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">All products are tested and certified for purity and effectiveness.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
              <p className="text-muted-foreground">Our nutrition experts are here to guide your fitness journey.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Heart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customer First</h3>
              <p className="text-muted-foreground">Your satisfaction and health are our top priorities.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Goals</h3>
              <p className="text-muted-foreground">We help you achieve your fitness goals with the right supplements.</p>
            </div>
          </div>

          <div className="prose prose-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Founded by fitness enthusiasts, we understand the importance of quality supplements in achieving your health goals.
              Our mission is to provide premium products that deliver real results.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every product we offer is carefully selected and tested to ensure it meets our high standards for quality,
              purity, and effectiveness. We're committed to transparency and helping you make informed choices about your health.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
