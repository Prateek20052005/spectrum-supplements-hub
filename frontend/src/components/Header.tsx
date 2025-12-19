import { ShoppingCart, Search, Menu, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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

type SearchProduct = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { cartCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const desktopSearchRootRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRootRef = useRef<HTMLDivElement | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

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

  const closeSearch = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleSubmitSearch = (q?: string) => {
    const term = (q ?? normalizedQuery).trim();
    if (!term) return;
    closeSearch();
    navigate(`/products?keyword=${encodeURIComponent(term)}`);
  };

  const handleSelectProduct = (p: SearchProduct) => {
    closeSearch();
    navigate(`/product/${p._id}`);
  };

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const desktopRoot = desktopSearchRootRef.current;
      const mobileRoot = mobileSearchRootRef.current;
      const target = e.target as Node;
      const insideDesktop = !!desktopRoot && desktopRoot.contains(target);
      const insideMobile = !!mobileRoot && mobileRoot.contains(target);
      if (!insideDesktop && !insideMobile) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const term = normalizedQuery;
    if (!term) {
      setResults([]);
      setLoading(false);
      fetchAbortRef.current?.abort();
      return;
    }

    setOpen(true);
    setLoading(true);

    const t = window.setTimeout(async () => {
      try {
        fetchAbortRef.current?.abort();
        const controller = new AbortController();
        fetchAbortRef.current = controller;

        const res = await fetch(
          `${API_BASE_URL}/api/products?keyword=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const list: SearchProduct[] = Array.isArray(data) ? data : [];
        setResults(list.slice(0, 6));
        setActiveIndex(-1);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [normalizedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && activeIndex < results.length) {
        handleSelectProduct(results[activeIndex]);
      } else {
        handleSubmitSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((prev) => {
        const next = Math.min(prev + 1, results.length - 1);
        return Number.isFinite(next) ? next : -1;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }
  };

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
          FREE protein shaker with orders over ₹4,000!
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
            <div ref={desktopSearchRootRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => normalizedQuery && setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search supplements..."
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />

              {open && normalizedQuery && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50">
                  <div className="p-2 text-xs text-muted-foreground border-b">
                    {loading ? "Searching..." : results.length ? "Top matches" : "No matches"}
                  </div>

                  {!loading && results.length > 0 && (
                    <div className="max-h-80 overflow-auto">
                      {results.map((p, idx) => {
                        const img = p.images?.[0] || "/placeholder.svg";
                        const active = idx === activeIndex;
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={() => handleSelectProduct(p)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                              active ? "bg-accent text-accent-foreground" : ""
                            }`}
                          >
                            <img
                              src={img}
                              alt={p.name}
                              className="w-9 h-9 rounded border object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground">₹{p.price}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleSubmitSearch()}
                    >
                      See all results for "{normalizedQuery}"
                    </Button>
                  </div>
                </div>
              )}
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
          <div ref={mobileSearchRootRef} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => normalizedQuery && setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search supplements..."
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />

            {open && normalizedQuery && (
              <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50">
                <div className="p-2 text-xs text-muted-foreground border-b">
                  {loading ? "Searching..." : results.length ? "Top matches" : "No matches"}
                </div>
                {!loading && results.length > 0 && (
                  <div className="max-h-80 overflow-auto">
                    {results.map((p, idx) => {
                      const img = p.images?.[0] || "/placeholder.svg";
                      const active = idx === activeIndex;
                      return (
                        <button
                          key={p._id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => handleSelectProduct(p)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                            active ? "bg-accent text-accent-foreground" : ""
                          }`}
                        >
                          <img
                            src={img}
                            alt={p.name}
                            className="w-9 h-9 rounded border object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">₹{p.price}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleSubmitSearch()}
                  >
                    See all results for "{normalizedQuery}"
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;