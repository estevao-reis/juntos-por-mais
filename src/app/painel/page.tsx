import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function PainelPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: announcements, error: announcementsError } = await supabase
    .from('Announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (announcementsError) {
    console.error("Erro ao buscar avisos:", announcementsError);
  }
  
  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Painel do Líder</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo, <span className="font-semibold text-primary">{user.email}</span>!
          </p>
        </div>
        <form action={signOut}>
          <Button variant="outline">Sair</Button>
        </form>
      </header>

      <main>
        <h2 className="text-2xl font-semibold tracking-tight">Seus Avisos</h2>
        
        <div className="mt-6 grid gap-6">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle>Comunicado Importante</CardTitle>
                  <CardDescription>
                    Publicado em: {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{announcement.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="mt-4 p-8 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">Nenhum aviso por enquanto.</p>
            </div>
          )}
        </div>
      </main>
    </div>
); }