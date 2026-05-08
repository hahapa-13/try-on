import { HomeNavbar }     from "@/app/components/HomeNavbar";
import { HeroSection }    from "@/app/components/HeroSection";
import { StatsSection }   from "@/app/components/StatsSection";
import { HowItWorks }     from "@/app/components/HowItWorks";
import { FeaturesSection }from "@/app/components/FeaturesSection";
import { CTASection }     from "@/app/components/CTASection";
import { HomeFooter }     from "@/app/components/HomeFooter";
import { ScrollReveal }   from "@/app/components/ScrollReveal";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;
  const navUser = user ? { id: user.id, email: user.email ?? null } : null;

  return (
    <>
      {/*
        HomeNavbar is rendered here (not in layout.tsx) so it gets the dark
        luxury treatment. The global white Navbar in layout.tsx is suppressed
        on "/" via the x-pathname middleware header.
      */}
      <HomeNavbar user={navUser} />

      <main
        className="relative min-h-screen grain"
        style={{ background: "var(--black)" }}
      >
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <FeaturesSection />
        <CTASection />
        <HomeFooter />
      </main>

      {/* Single IntersectionObserver that drives all .reveal elements */}
      <ScrollReveal />
    </>
  );
}
