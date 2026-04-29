import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { OrderForm } from "@/components/landing/OrderForm";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { Reviews } from "@/components/landing/Reviews";
import { Description } from "@/components/landing/Description";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { InfiniteBanner } from "@/components/landing/InfiniteBanner";
import { Toaster } from "@/components/ui/sonner";
import { PixelManager } from "@/components/PixelManager";
import { BeforeAfter } from "@/components/landing/BeforeAfter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 overflow-x-hidden">
      <div className="bg-red-600 text-white text-center py-4 font-bold text-xl w-full z-50 relative shadow-md">
        the host is down pls
      </div>
      <PixelManager />
      <Header />
      <InfiniteBanner />
      <main>
        <Hero />
        
        <section className="py-2">
          <div className="mx-auto max-w-5xl px-4">
            <img 
              src="/AFTER HOME PAGE.jpg" 
              alt="معلومات إضافية" 
              className="w-full h-auto rounded-[1.5rem] shadow-lg border border-white/20" 
              loading="lazy" 
            />
          </div>
        </section>

        <OrderForm />
        <TrustBadges />
        <Reviews />
        <BeforeAfter />


        <Description />
        <FeatureCards />
        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
      <Toaster position="top-center" richColors />
    </div>
  );
}
