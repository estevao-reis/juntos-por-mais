'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { CausesSection } from '@/components/CausesSection';
import { CTASection } from '@/components/CTASection';

interface BaseData {
  id: string;
  name: string;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const leaderRefId = searchParams.get('ref') || undefined;

  const [leaders, setLeaders] = useState<BaseData[]>([]);
  const [regions, setRegions] = useState<BaseData[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [leadersRes, regionsRes] = await Promise.all([
        supabase.from('Users').select('id, name').eq('role', 'LEADER'),
        supabase.from('AdministrativeRegions').select('id, name').order('name')
      ]);

      if (leadersRes.data) {
        setLeaders(leadersRes.data);
      }
      if (leadersRes.error) {
        console.error('Erro ao buscar líderes:', leadersRes.error);
      }

      if (regionsRes.data) {
        setRegions(regionsRes.data);
      }
      if (regionsRes.error) {
        console.error('Erro ao buscar RAs:', regionsRes.error);
    } }

    fetchData();
  }, []);

  return (
    <>
      <HeroSection />
      <CausesSection />
      <CTASection leaders={leaders} regions={regions} leaderRefId={leaderRefId} />
      <AboutSection />
    </>
); }