import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center font-bold text-primary text-lg">
                S
              </div>
              <div className="text-primary-foreground font-bold text-lg">
                SupplementStore
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted partner in fitness nutrition. Premium supplements for serious athletes and fitness enthusiasts.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 p-2">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 p-2">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-foreground/10 p-2">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Shop", "Categories", "Blog", "Contact"].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Categories</h3>
            <ul className="space-y-2">
              {["Whey Proteins", "Pre-Workout", "Creatine", "Vitamins", "Amino Acids", "Mass Gainers"].map((category) => (
                <li key={category}>
                  <a 
                    href="#" 
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Stay Updated</h3>
            <p className="text-primary-foreground/80 text-sm">
              Get the latest deals and fitness tips delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button className="w-full bg-gradient-cta hover:shadow-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-accent" />
              <div>
                <p className="text-primary-foreground font-medium">Call Us</p>
                <p className="text-primary-foreground/80 text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-accent" />
              <div>
                <p className="text-primary-foreground font-medium">Email</p>
                <p className="text-primary-foreground/80 text-sm">support@supplementstore.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent" />
              <div>
                <p className="text-primary-foreground font-medium">Address</p>
                <p className="text-primary-foreground/80 text-sm">123 Fitness St, Muscle City</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 SupplementStore. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;