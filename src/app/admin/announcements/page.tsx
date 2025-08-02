// src/app/admin/announcements/page.tsx
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('Users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/painel');

  // Busca os avisos existentes para listar na página
  const { data: announcements } = await supabase.from('Announcements').select('*').order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-8 grid gap-12">
      <div>
        <h1 className="text-3xl font-bold">Enviar Novo Aviso</h1>
        <p className="text-muted-foreground mt-2">A mensagem será enviada para todos os líderes.</p>
        <div className="mt-6">
          <AnnouncementForm />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">Avisos Enviados</h2>
        <div className="mt-6 grid gap-4">
          {announcements && announcements.length > 0 ? (
            announcements.map(announcement => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardDescription>
                    Enviado em {new Date(announcement.created_at).toLocaleString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {announcement.content}
                </CardContent>
              </Card>
          )) ) : (
            <p className="text-muted-foreground text-center py-4">Nenhum aviso enviado ainda.</p>
          )}
        </div>
      </div>
    </div>
); }