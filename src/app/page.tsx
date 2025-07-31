import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from './components/RegistrationForm';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: leaders, error } = await supabase
    .from('Users')
    .select('id, name')
    .eq('role', 'LEADER');

  if (error) {
    console.error('Erro ao buscar líderes:', error);
  }

  return (
    <main className="container mx-auto p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Estevão Reis</h1>
        <p className="text-xl text-gray-600 mt-2">Descrição</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-center mb-6">Participe</h2>
        <RegistrationForm leaders={leaders || []} />
      </section>
    </main>
); }