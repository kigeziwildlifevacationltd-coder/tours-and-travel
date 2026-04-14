import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { services } from "@/data/services";
import heroImg from "@/assets/images/tree-climbing-lionesses-resting-0063.jpg";

const Services = () => {
  return (
    <Layout>
      <SEOHead
        title="Our Safari Services"
        description="Comprehensive safari services including airport transfers, permit processing, accommodation booking, car rentals, and custom tour planning in Uganda."
        canonical="/services"
      />
      <PageHero
        title="Our Services"
        subtitle="Everything you need for a seamless Uganda safari experience"
        backgroundImage={heroImg}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-lg bg-card border border-border card-hover"
              >
                <div className="w-12 h-12 rounded-full safari-gradient flex items-center justify-center mb-4">
                  <service.icon size={20} className="text-primary-foreground" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
