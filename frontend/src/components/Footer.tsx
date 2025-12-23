import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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
              <a 
                href="https://www.facebook.com/share/16xNwU2Zfs/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-accent transition-colors p-2"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/supp_by_ksn?igsh=MXgzdmRtNXFpaDhjbA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-accent transition-colors p-2"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Shop", "Categories", "Blog", "Contact"].map((link) => {
                const linkMap: { [key: string]: string } = {
                  "Home": "/",
                  "About Us": "/about",
                  "Shop": "/products",
                  "Categories": "/categories",
                  "Blog": "/blog",
                  "Contact": "/contact"
                };
                return (
                  <li key={link}>
                    <Link 
                      to={linkMap[link] || "#"}
                      className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-semibold text-lg">Categories</h3>
            <ul className="space-y-2">
              {["Whey Proteins", "Pre-Workout", "Creatine", "Vitamins", "Amino Acids", "Mass Gainers"].map((category) => {
                const categoryMap: { [key: string]: string } = {
                  "Whey Proteins": "/category/whey-proteins",
                  "Pre-Workout": "/category/pre-workout",
                  "Creatine": "/category/creatine",
                  "Vitamins": "/category/vitamins",
                  "Amino Acids": "/category/amino-acids",
                  "Mass Gainers": "/category/mass-gainers"
                };
                return (
                  <li key={category}>
                    <Link 
                      to={categoryMap[category] || "#"}
                      className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                    >
                      {category}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-accent" />
              <div>
                <p className="text-primary-foreground font-medium">Call Us</p>
                <p className="text-primary-foreground/80 text-sm">+91 99908 66695</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-accent" />
              <div>
                <p className="text-primary-foreground font-medium">Email</p>
                <p className="text-primary-foreground/80 text-sm">suppbyksn@gmail.com</p>
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
            © 2026 KSN. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;