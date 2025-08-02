import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from '@/app/components/RegistrationForm';

export default async function CadastroPage() {
  const supabase = await createClient();
  
  const { data: leaders, error } = await supabase
    .from('Users')
    .select('id, name')
    .eq('role', 'LEADER');

  if (error) {
    console.error('Erro ao buscar líderes:', error);
  }
  
  return (
    <section id="cadastro" className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Torne-se um Parceiro</h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Preencha o formulário abaixo para se juntar à nossa rede exclusiva de parceiros.
          </p>
        </div>
        <RegistrationForm leaders={leaders || []} />
      </div>
    </section>
); }