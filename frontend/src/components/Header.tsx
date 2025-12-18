import { ShoppingCart, Search, Menu, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { cartCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);
        setIsAdmin(userData?.role === "admin");
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setIsAdmin(false);
    navigate("/");
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
  };
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10 group h-9 w-9 p-0 rounded-full"
                    aria-label={isAdmin ? "Admin menu" : "User menu"}
                  >
                    {isAdmin ? (
                      <Shield className="h-5 w-5 group-hover:text-accent" />
                    ) : (
                      <User className="h-5 w-5 group-hover:text-accent" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 group"
                  aria-label="Sign in"
                  title="Sign in"
                >
                  <User className="w-5 h-5 group-hover:text-accent" />
                </Button>
              </Link>
            )}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
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