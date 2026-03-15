import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Timeline from '@/components/Timeline';
import Projects from '@/components/Projects';
import UnitModels from '@/components/UnitModels';
import Contact from '@/components/Contact';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import SecretLoginTrigger from '@/components/SecretLoginTrigger';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, YoutubeIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header variant="home" />
      <Hero />
      <About />
      <Services />
      <Projects />
      <div aria-hidden className="relative bg-gray-50">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.10),transparent_55%)]" />
        <div className="container-custom py-10 md:py-14">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20" />
              <div className="w-10 h-10 rounded-2xl rotate-45 bg-gold-gradient border border-white/40 shadow-[0_10px_30px_rgba(212,175,55,0.25)]" />
              <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>
        </div>
      </div>
      <UnitModels />
      <Timeline />
      <Contact />
      <MapSection />
      <Footer />
      <SecretLoginTrigger />
    </main>
  );
}
