import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/images/kigezi-wildlife-adventures-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Kigezi Wildlife Vacation Safaris logo" className="h-10 w-auto" />
              <h3 className="text-xl font-serif font-bold text-accent">Kigezi Wildlife Vacation Safaris</h3>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner for unforgettable safari experiences in Uganda. We specialize in gorilla trekking, wildlife safaris, and cultural tours.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Tours", to: "/tours" },
                { label: "Destinations", to: "/destinations" },
                { label: "Services", to: "/services" },
                { label: "About Us", to: "/about" },
                { label: "Gallery", to: "/gallery" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Top Destinations</h4>
            <div className="flex flex-col gap-2">
              {["Bwindi National Park", "Queen Elizabeth NP", "Murchison Falls NP", "Kibale National Park", "Lake Bunyonyi"].map((dest) => (
                <span key={dest} className="text-sm text-primary-foreground/70">{dest}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-accent">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@kigeziwildlifevacationsafaris.com" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail size={16} />
                info@kigeziwildlifevacationsafaris.com
              </a>
              <a href="tel:+256700000000" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone size={16} />
                +256 700 000 000
              </a>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin size={16} />
                Kampala, Uganda
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Kigezi Wildlife Vacation Safaris. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
