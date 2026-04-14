import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import heroImg from "@/assets/images/gorilla-family-among-leaves-0083.jpg";
import gorillaImg from "@/assets/images/gorilla-closeup-in-jungle-0044.jpg";
import { Users, Award, MapPin, Heart } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <SEOHead
        title="About Us"
        description="Learn about Kigezi Wildlife Vacation Safaris — a trusted Uganda safari company offering gorilla trekking, wildlife tours, and adventure experiences."
        canonical="/about"
      />
      <PageHero
        title="About Us"
        subtitle="Your trusted safari partner in the heart of Africa"
        backgroundImage={heroImg}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Our Story</p>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                Passionate About Uganda's Wildlife
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kigezi Wildlife Vacation Safaris was born from a deep love for Uganda's extraordinary wildlife and landscapes. Based in the heart of the Kigezi region — known as the "Switzerland of Africa" — we bring years of local expertise to every safari we organize.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our team of experienced guides and travel planners are committed to creating unforgettable experiences while supporting conservation and local communities. From gorilla trekking in Bwindi to game drives in Queen Elizabeth National Park, we ensure every moment is magical.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a solo traveler, a couple on a romantic getaway, or a group of adventurers, we tailor every safari to your unique interests and pace.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img
                src={gorillaImg}
                alt="Mountain gorilla in Bwindi Forest"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Users, value: "500+", label: "Happy Travelers" },
              { icon: Award, value: "10+", label: "Years Experience" },
              { icon: MapPin, value: "35+", label: "Destinations" },
              { icon: Heart, value: "100%", label: "Commitment" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-lg bg-card border border-border">
                <stat.icon size={28} className="text-accent mx-auto mb-2" />
                <div className="text-2xl font-serif font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
