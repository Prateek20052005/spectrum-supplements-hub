import { ShoppingCart, Search, Menu, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setIsAdmin(user?.role === "admin");
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
  }, []);
  return (
    <header className="bg-gradient-hero shadow-hero sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-accent text-accent-foreground py-2 px-4">
        <div className="container mx-auto text-center text-sm font-medium">
          🎁 FREE protein shaker with orders over $50! 💪
        </div>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center font-bold text-primary text-xl">
              S
            </div>
            <div className="text-primary-foreground font-bold text-xl">
              SupplementStore
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-primary-foreground hover:text-accent transition-colors font-medium">
              Home
            </a>
            <a href="/products" className="text-primary-foreground hover:text-accent transition-colors font-medium">
              Products
            </a>
            <a href="/categories" className="text-primary-foreground hover:text-accent transition-colors font-medium">
              Categories
            </a>
            <a href="/about" className="text-primary-foreground hover:text-accent transition-colors font-medium">
              About
            </a>
            <a href="/contact" className="text-primary-foreground hover:text-accent transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search supplements..."
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 group"
                  aria-label="Admin Dashboard"
                  title="Admin Dashboard"
                >
                  <Shield className="w-5 h-5 group-hover:text-accent" />
                </Button>
              </Link>
            ) : (
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 group"
                  aria-label="Profile"
                  title="My Profile"
                >
                  <User className="w-5 h-5 group-hover:text-accent" />
                </Button>
              </Link>
            )}
            <a href="/cart">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </a>
            <Button variant="ghost" size="sm" className="md:hidden text-primary-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search supplements..."
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;