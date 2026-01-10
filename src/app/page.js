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
      <UnitModels />
      <Timeline />
      <Contact />
      <MapSection />
      <Footer />
      <SecretLoginTrigger />
    </main>
  );
}
