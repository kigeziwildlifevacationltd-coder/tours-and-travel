import { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import heroImg from "@/assets/images/gorilla-family-among-leaves-0083.jpg";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for your inquiry. We'll get back to you within 24 hours.",
    });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Kigezi Wildlife Vacation Safaris to plan your Uganda safari. Request a quote, ask questions, or book your adventure."
        canonical="/contact"
      />
      <PageHero
        title="Contact Us"
        subtitle="Let's plan your dream Uganda safari together"
        backgroundImage={heroImg}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Get In Touch</h2>
              <p className="text-muted-foreground mb-8">
                Ready to explore Uganda? Fill out the form and our team will craft the perfect safari for you. We typically respond within 24 hours.
              </p>

              <div className="space-y-4">
                <a href="mailto:info@kigeziwildlifevacationsafaris.com" className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                  <div className="w-10 h-10 rounded-full safari-gradient flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">info@kigeziwildlifevacationsafaris.com</div>
                  </div>
                </a>
                <a href="tel:+256700000000" className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                  <div className="w-10 h-10 rounded-full safari-gradient flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Phone</div>
                    <div className="text-sm text-muted-foreground">+256 700 000 000</div>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-full safari-gradient flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Location</div>
                    <div className="text-sm text-muted-foreground">Kampala, Uganda</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h3 className="text-xl font-serif font-bold text-foreground mb-6">Send Us a Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="+256 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Tell us about your dream safari..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md gold-gradient text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
