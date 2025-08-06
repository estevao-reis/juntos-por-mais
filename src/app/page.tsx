import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from './components/RegistrationForm';
import { Instagram, Facebook } from 'lucide-react';

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

  const bossInfo = {
    name: "Juntos com Estêvão Reis",
    bio: "Chefe da Ass. Artic. Instit. da Vice-Governadoria",
    socials: [
      { name: "Instagram", url: "https://instagram.com/estevao_reis", icon: <Instagram className="h-6 w-6" /> },
      { name: "Facebook", url: "https://facebook.com/estevaoreisdf", icon: <Facebook className="h-6 w-6" /> },
  ] };

  return (
    <>
      <header 
        className="h-[50vh] relative flex items-center bg-cover bg-center" 
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              {bossInfo.name}
            </h1>
            <p className="mt-3 text-lg text-gray-300">
              {bossInfo.bio}
            </p>
            <div className="mt-6 flex space-x-6">
              {bossInfo.socials.map((social) => (
                <a key={social.name} href={social.url} className="text-gray-300 hover:text-white transition-colors duration-300">
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="cadastro" className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Junte-se ao Movimento</h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Preencha o formulário abaixo para se tornar um apoiador e fazer parte da nossa rede.
            </p>
          </div>
          <RegistrationForm leaders={leaders} regions={regions} />
        </div>
      </section>
    </>
); }