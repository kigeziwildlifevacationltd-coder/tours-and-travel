import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { getImage } from "@/lib/images";
import heroImg from "@/assets/images/lake-islands-overlook-0031.jpg";

const galleryImages = [
  { src: "gorilla", alt: "Mountain gorilla in Bwindi Impenetrable Forest" },
  { src: "tree-lions", alt: "Tree climbing lions in Ishasha" },
  { src: "chimp", alt: "Chimpanzee in Kibale National Park" },
  { src: "murchison", alt: "Murchison Falls on the Nile" },
  { src: "lake-bunyonyi", alt: "Scenic Lake Bunyonyi" },
  { src: "gorilla", alt: "Gorilla trekking adventure" },
  { src: "tree-lions", alt: "Wildlife safari in Queen Elizabeth NP" },
  { src: "chimp", alt: "Primate tracking experience" },
  { src: "murchison", alt: "Uganda's stunning landscapes" },
];

const Gallery = () => {
  return (
    <Layout>
      <SEOHead
        title="Photo Gallery"
        description="Browse stunning photos from our Uganda safari tours including gorilla trekking, wildlife encounters, and breathtaking landscapes."
        canonical="/gallery"
      />
      <PageHero
        title="Gallery"
        subtitle="Moments captured from our incredible safari adventures"
        backgroundImage={heroImg}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="break-inside-avoid rounded-lg overflow-hidden card-hover">
                <img
                  src={getImage(img.src)}
                  alt={img.alt}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  width={800}
                  height={600}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
