import { createClient } from "@/lib/supabase/server";
import { LeaderRegistrationForm } from "../components/LeaderRegistrationForm";

export default async function SejaUmLiderPage() {
  const supabase = await createClient();
  const { data: regions, error } = await supabase
    .from('AdministrativeRegions')
    .select('id, name')
    .order('name');

  if (error) {
    console.error("Erro ao buscar RAs:", error);
  }

  return (
    <section id="seja-um-lider" className="py-20 bg-muted/40 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Junte-se a Nós como Líder</h1>
          <p className="mt-4 text-muted-foreground">
            <strong>Ser um de nossos líderes significa ter mais responsabilidades, mas também maiores oportunidades</strong>.
            Você terá acesso a um link exclusivo para convidar novos parceiros, participará mais ativamente de nossas 
            iniciativas e seu trabalho ganhará maior destaque. Só depende de você!
          </p>
          <p className="mt-4 text-muted-foreground">
            Para garantir o comprometimento, pedimos algumas <strong>informações adicionais</strong>. Preencha o formulário abaixo para 
            iniciar sua jornada como líder.
          </p>
        </div>
        <LeaderRegistrationForm regions={regions || []} />
      </div>
    </section>
); }