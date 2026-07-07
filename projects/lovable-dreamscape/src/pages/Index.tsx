import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ChallengeSection } from "@/components/sections/ChallengeSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { PipelineSection } from "@/components/sections/PipelineSection";
import { WhatWeTeachSection } from "@/components/sections/WhatWeTeachSection";
import { LearningMethodSection } from "@/components/sections/LearningMethodSection";
import { WhoBenefitsSection } from "@/components/sections/WhoBenefitsSection";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { FutureSection } from "@/components/sections/FutureSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/Footer";
import { GoldenDivider } from "@/components/SectionAccents";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <GoldenDivider />
      <ChallengeSection />
      <GoldenDivider flip />
      <AboutSection />
      <GoldenDivider />
      <PipelineSection />
      <GoldenDivider flip />
      <WhatWeTeachSection />
      <GoldenDivider />
      <LearningMethodSection />
      <GoldenDivider flip />
      <WhoBenefitsSection />
      <GoldenDivider />
      <ResultsSection />
      <GoldenDivider flip />
      <ComparisonSection />
      <GoldenDivider />
      <ProgramsSection />
      <GoldenDivider flip />
      <FutureSection />
      <GoldenDivider />
      <GallerySection />
      <GoldenDivider flip />
      <PricingSection />
      <GoldenDivider />
      <TestimonialsSection />
      <GoldenDivider flip />
      <BlogSection />
      <GoldenDivider />
      <FAQSection />
      <GoldenDivider flip />
      <CTASection />
      <GoldenDivider />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
