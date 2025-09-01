import { AnnouncementForm } from "@/components/AnnouncementForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnnouncementCard } from "@/components/AnnouncementCard";

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/painel');

  const { data: announcements } = await supabase.from('Announcements').select('*').order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-8 grid gap-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Avisos</h1>
          <p className="text-muted-foreground mt-2">Envie, edite ou exclua comunicados para os líderes.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Novo Comunicado</h2>
          <AnnouncementForm />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Avisos Enviados</h2>
          <div className="grid gap-4">
            {announcements && announcements.length > 0 ? (
              announcements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum aviso enviado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
); }