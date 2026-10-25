import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Timeline from '@/components/Timeline';
import Projects from '@/components/Projects';
import UnitModels from '@/components/UnitModels';
import Contact from '@/components/Contact';
import InterestRegistration from '@/components/InterestRegistration';
import InterestQuickAccess from '@/components/InterestQuickAccess';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import SecretLoginTrigger from '@/components/SecretLoginTrigger';
import '@/components/HomeExperience.css';
import '@/components/ClosingExperience.css';

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-white">
      <Header variant="home" />
      <Hero />
      <About />
      <Projects />
      <UnitModels />
      <Services />
      <Timeline />
      <InterestRegistration />
      <Contact />
      <MapSection />
      <Footer />
      <InterestQuickAccess />
      <SecretLoginTrigger />
    </main>
  );
}
