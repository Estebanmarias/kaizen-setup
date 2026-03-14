import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import HowItWorks from "@/components/HowItWorks";
import Partners from "@/components/Partners";
import UGC from "@/components/UGC";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Services />
      <Reviews />
      <div data-aos="fade-up">
        <HowItWorks />
      </div>
      <Partners />
      <div data-aos="fade-right">
        <UGC />
      </div>
      <div data-aos="fade-up">
        <Blog />
      </div>
      <div data-aos="fade-up">
        <Contact />
      </div>
      <div data-aos="fade-up">
        <NewsletterSection />
      </div>
      <Footer />
    </main>
  );
}