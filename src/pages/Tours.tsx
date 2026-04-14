import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { tours } from "@/data/tours";
import { getImage } from "@/lib/images";
import heroImg from "@/assets/images/sunset-over-mountain-ridges-0081.jpg";
import { Clock } from "lucide-react";

const Tours = () => {
  return (
    <Layout>
      <SEOHead
        title="Safari Tour Packages"
        description="Browse our Uganda safari tour packages from 3 to 25 days. Gorilla trekking, wildlife safaris, cultural tours and more."
        canonical="/tours"
      />
      <PageHero
        title="Our Safari Tours"
        subtitle="From short getaways to grand expeditions — find your perfect Uganda safari"
        backgroundImage={heroImg}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.slug}
                to={`/tours/${tour.slug}`}
                className="group rounded-lg overflow-hidden bg-card card-hover border border-border"
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
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tour.highlights.map((h) => (
                      <span key={h} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tours;
