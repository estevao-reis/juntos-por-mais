import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { CTASection } from '@/components/CTASection';

export default async function HomePage() {
  const supabase = await createClient();
  
  const [leadersRes, regionsRes] = await Promise.all([
    supabase.from('Users').select('id, name').eq('role', 'LEADER'),
    supabase.from('AdministrativeRegions').select('id, name').order('name')
  ]);

  const leaders = leadersRes.data || [];
  const regions = regionsRes.data || [];

  if (leadersRes.error) console.error('Erro ao buscar líderes:', leadersRes.error);
  if (regionsRes.error) console.error('Erro ao buscar RAs:', regionsRes.error);

  return (
    <>
      <HeroSection />
      <CTASection leaders={leaders} regions={regions} />
      <AboutSection />
    </>
); }