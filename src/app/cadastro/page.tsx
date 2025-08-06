import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from '../components/RegistrationForm';

export default async function CadastroPage({ searchParams }: { searchParams: { ref?: string } }) {
  const supabase = await createClient();
  const leaderRefId = searchParams.ref;

  const [leadersRes, regionsRes] = await Promise.all([
    supabase.from('Users').select('id, name').eq('role', 'LEADER'),
    supabase.from('AdministrativeRegions').select('id, name').order('name')
  ]);

  const leaders = leadersRes.data || [];
  const regions = regionsRes.data || [];

  if (leadersRes.error) console.error('Erro ao buscar líderes:', leadersRes.error);
  if (regionsRes.error) console.error('Erro ao buscar RAs:', regionsRes.error);
  
  return (
    <section id="cadastro" className="py-12 bg-muted/40 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Torne-se um Apoiador</h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Preencha o formulário abaixo para se juntar à nossa rede exclusiva.
          </p>
        </div>
        
        <RegistrationForm leaders={leaders} regions={regions} defaultLeaderId={leaderRefId} />
      </div>
    </section>
); }