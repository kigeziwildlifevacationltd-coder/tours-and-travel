import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { destinations } from "@/data/destinations";
import { tours } from "@/data/tours";
import { getImage } from "@/lib/images";
import { MapPin, Clock } from "lucide-react";

const DestinationDetail = () => {
  const { slug } = useParams();
  const dest = destinations.find((d) => d.slug === slug);

  if (!dest) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Destination Not Found</h1>
            <Link to="/destinations" className="text-accent hover:underline">Browse all destinations</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={dest.name}
        description={dest.description}
        canonical={`/destinations/${dest.slug}`}
      />
      <section
        className="relative h-[50vh] md:h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage(dest.image)})` }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 h-full flex items-end pb-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 text-accent mb-2">
              <MapPin size={16} />
              <span className="text-sm font-medium">Uganda</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">
              {dest.name}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{dest.description}</p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            This destination is one of Uganda's most remarkable places to visit. Whether you're a wildlife enthusiast, nature lover, or cultural explorer, you'll find something truly special here. Our expert guides will ensure you have the most authentic experience possible.
          </p>
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-block px-8 py-3 rounded-md gold-gradient text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Plan a Visit
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DestinationDetail;
