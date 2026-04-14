import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { tours } from "@/data/tours";
import { destinations } from "@/data/destinations";
import { getImage } from "@/lib/images";
import heroImg from "@/assets/images/gorilla-mother-with-infant-0016.jpg";
import gorillaImg from "@/assets/images/gorilla-closeup-in-jungle-0044.jpg";
import treeLionsImg from "@/assets/images/tree-climbing-lionesses-resting-0063.jpg";
import chimpImg from "@/assets/images/chimpanzee-portrait-in-greenery-0057.jpg";
import { MapPin, Clock, Star, Users, Shield, Heart } from "lucide-react";

const Index = () => {
  const featuredTours = tours.slice(0, 6);
  const topDestinations = destinations.filter(d => d.category === "national-park").slice(0, 6);

  return (
    <Layout>
      <SEOHead
        title="Uganda Safari Tours & Gorilla Trekking"
        description="Kigezi Wildlife Vacation Safaris offers unforgettable gorilla trekking, wildlife safaris, and adventure tours across Uganda. Book your dream safari today."
        canonical="/"
      />

      {/* Hero */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 animate-fade-in">
            Discover Uganda's Wild Beauty
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Unforgettable Safari Adventures
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Experience gorilla trekking, tree-climbing lions, and the breathtaking landscapes of the Pearl of Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Link
              to="/tours"
              className="px-8 py-3 rounded-md gold-gradient text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Tours
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-md border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              Plan Your Safari
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Your Trusted Safari Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Expert Local Guides", desc: "Our guides are born and raised in Uganda with deep knowledge of wildlife and culture." },
              { icon: Star, title: "Tailored Experiences", desc: "Every safari is customized to your interests, budget, and schedule." },
              { icon: Heart, title: "Conservation First", desc: "We support local communities and wildlife conservation initiatives." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-lg bg-card card-hover">
                <div className="w-14 h-14 rounded-full safari-gradient flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Our Safari Packages</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Featured Tours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTours.map((tour) => (
              <Link
                key={tour.slug}
                to={`/tours/${tour.slug}`}
                className="group rounded-lg overflow-hidden bg-card card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getImage(tour.image)}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                    <Clock size={14} />
                    {tour.duration}
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{tour.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/tours"
              className="inline-block px-8 py-3 rounded-md safari-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              View All Tours
            </Link>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Explore Uganda</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Top Destinations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDestinations.map((dest) => (
              <Link
                key={dest.slug}
                to={`/destinations/${dest.slug}`}
                className="group relative rounded-lg overflow-hidden aspect-[4/3] card-hover"
              >
                <img
                  src={getImage(dest.image)}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1 text-accent text-sm mb-1">
                    <MapPin size={14} />
                    National Park
                  </div>
                  <h3 className="font-serif font-semibold text-primary-foreground text-lg">{dest.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/destinations"
              className="inline-block px-8 py-3 rounded-md safari-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 md:py-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${gorillaImg})` }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            Ready for Your Uganda Safari?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Let us craft the perfect safari experience for you. Contact our team to start planning your adventure today.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 rounded-md gold-gradient text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
