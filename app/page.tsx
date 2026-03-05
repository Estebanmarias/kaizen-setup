import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import HowItWorks from "@/components/HowItWorks";
import Partners from "@/components/Partners";
import UGC from "@/components/UGC";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Reviews />
      <HowItWorks />
      <Partners />
      <UGC />
      <Blog />
      <Contact />
      <Footer />
    </main>
  );
}