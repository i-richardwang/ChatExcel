import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Press } from '@/components/press';
import Solution from '@/components/solution';
import HowItWorks from '@/components/how-it-works';
export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Press />
        <Problem />
        <Solution />
        <HowItWorks />
        {/* <FeaturesAccordion /> */}
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}