import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { destinations } from "@/data/destinations";
import { getImage } from "@/lib/images";
import heroImg from "@/assets/images/river-and-hills-panorama-0028.jpg";
import { MapPin } from "lucide-react";

const categoryLabels: Record<string, string> = {
  "national-park": "National Parks",
  lake: "Lakes",
  "wildlife-reserve": "Wildlife Reserves",
  cultural: "Cultural Sites",
  city: "Cities & Towns",
  other: "Other Attractions",
};

const Destinations = () => {
  const grouped = destinations.reduce((acc, dest) => {
    if (!acc[dest.category]) acc[dest.category] = [];
    acc[dest.category].push(dest);
    return acc;
  }, {} as Record<string, typeof destinations>);

  return (
    <Layout>
      <SEOHead
        title="Safari Destinations in Uganda"
        description="Explore Uganda's top safari destinations including Bwindi, Queen Elizabeth, Murchison Falls, Kibale and more national parks."
        canonical="/destinations"
      />
      <PageHero
        title="Destinations"
        subtitle="Discover Uganda's incredible diversity of landscapes, wildlife, and culture"
        backgroundImage={heroImg}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {Object.entries(grouped).map(([category, dests]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dests.map((dest) => (
                  <Link
                    key={dest.slug}
                    to={`/destinations/${dest.slug}`}
                    className="group rounded-lg overflow-hidden bg-card card-hover border border-border"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={getImage(dest.image)}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-accent text-xs font-medium mb-1">
                        <MapPin size={12} />
                        {categoryLabels[dest.category]}
                      </div>
                      <h3 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{dest.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Destinations;
