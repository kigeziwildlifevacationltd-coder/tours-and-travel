import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { tours } from "@/data/tours";
import { getImage } from "@/lib/images";
import { Clock, MapPin, Check } from "lucide-react";

const TourDetail = () => {
  const { slug } = useParams();
  const tour = tours.find((t) => t.slug === slug);

  if (!tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Tour Not Found</h1>
            <Link to="/tours" className="text-accent hover:underline">Browse all tours</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={tour.title}
        description={tour.description}
        canonical={`/tours/${tour.slug}`}
      />
      <section
        className="relative h-[50vh] md:h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage(tour.image)})` }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 h-full flex items-end pb-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
              <Clock size={16} />
              {tour.duration}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">
              {tour.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About This Safari</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{tour.description}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This carefully crafted safari itinerary takes you through some of Uganda's most remarkable landscapes and wildlife encounters. Every detail is planned to ensure you have the most authentic and memorable experience possible.
              </p>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">Tour Highlights</h3>
              <ul className="space-y-2 mb-8">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-muted-foreground">
                    <Check size={16} className="text-accent flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">What's Included</h3>
              <ul className="space-y-2 text-muted-foreground">
                {["Professional English-speaking guide", "4x4 safari vehicle transport", "Accommodation as per itinerary", "All park entrance fees", "Gorilla/chimpanzee tracking permits", "All meals during the tour", "Bottled drinking water"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={16} className="text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">Book This Tour</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} className="text-accent" />
                    Duration: {tour.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} className="text-accent" />
                    Uganda
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 rounded-md gold-gradient text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  Inquire Now
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Custom pricing based on group size and dates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TourDetail;
