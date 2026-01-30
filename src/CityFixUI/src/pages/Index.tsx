import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { RecentTicketsSection } from '@/components/home/RecentTicketsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RecentTicketsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
