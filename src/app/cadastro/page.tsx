'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RegistrationForm } from '../components/RegistrationForm';

interface BaseData {
  id: string;
  name: string;
}

export default function CadastroPage() {
  const searchParams = useSearchParams();
  const leaderRefId = searchParams.get('ref') || undefined;

  const [leaders, setLeaders] = useState<BaseData[]>([]);
  const [regions, setRegions] = useState<BaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);
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
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <section id="cadastro" className="py-12 bg-muted/40 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Junte-se a Nós como <strong>Apoiador</strong></h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Preencha o formulário abaixo para se juntar à nossa rede exclusiva de <strong>apoiadores</strong>.
          </p>
        </div>
        {loading ? (
          <div className="text-center">
            <p>Carregando formulário...</p>
          </div>
        ) : (
          <RegistrationForm leaders={leaders} regions={regions} defaultLeaderId={leaderRefId} />
        )}
      </div>
    </section>
); }