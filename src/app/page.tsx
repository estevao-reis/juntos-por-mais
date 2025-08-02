import { createClient } from '@/lib/supabase/server';
import { RegistrationForm } from './components/RegistrationForm';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data: leaders, error } = await supabase
    .from('Users')
    .select('id, name')
    .eq('role', 'LEADER');

  if (error) {
    console.error('Erro ao buscar líderes:', error);
  }

  const bossInfo = {
    name: "Estevão Reis",
    bio: "CEO e Fundador | Especialista em Conexões Estratégicas",
    socials: [
      { name: "Instagram", url: "#", icon: <Instagram className="h-6 w-6" /> },
      { name: "Twitter", url: "#", icon: <Twitter className="h-6 w-6" /> },
      { name: "LinkedIn", url: "#", icon: <Linkedin className="h-6 w-6" /> },
  ] };

  return (
    <>
      <header 
        className="h-[35vh] relative flex items-center bg-cover bg-center" 
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute top-6 right-6 z-20">
          <Link href={user ? "/painel" : "/login"}>
            <Button variant="outline">
              {user ? "Acessar Painel" : "Login"}
            </Button>
          </Link>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Torne-se um Parceiro</h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Preencha o formulário abaixo para se juntar à nossa rede exclusiva de parceiros.
            </p>
          </div>
          <RegistrationForm leaders={leaders || []} />
        </div>
      </section>
    </>
); }