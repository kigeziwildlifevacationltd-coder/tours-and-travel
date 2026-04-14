import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/images/kigezi-wildlife-adventures-logo.png";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Tours", to: "/tours" },
  { label: "Destinations", to: "/destinations" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Kigezi Wildlife Vacation Safaris logo" className="h-10 md:h-12 w-auto" />
            <span className="text-xl md:text-2xl font-serif font-bold text-primary-foreground">
              Kigezi Wildlife
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="ml-4 px-5 py-2 rounded-md gold-gradient text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-primary-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-primary-foreground/10">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-4 py-3 text-primary-foreground/80 hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="block mx-4 mt-2 px-5 py-2 rounded-md gold-gradient text-accent-foreground text-sm font-semibold text-center"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
