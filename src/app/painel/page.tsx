import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getReferredSupporters } from "@/lib/actions/user.actions";
import { SupportersList } from "@/components/SupportersList";
import { UpcomingEventsList } from "@/components/UpcomingEventsList";
import { ReferralLink } from "@/components/ReferralLink";
import { Leaderboard } from "@/components/Leaderboard";

export default async function PainelPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('Users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return redirect('/login');
  }

  const isLeader = profile.role === 'LEADER' || profile.role === 'ADMIN';

  const [announcementsRes, supportersRes, eventsRes, leaderStatsRes] = await Promise.all([
    supabase.from('Announcements').select('*').order('created_at', { ascending: false }),
    getReferredSupporters(),
    supabase.rpc('get_event_stats'),
    supabase.rpc('get_leader_partner_counts')
  ]);

  const announcements = announcementsRes.data || [];
  const supporters = supportersRes;
  const events = eventsRes.data || [];
  const leaderStats = leaderStatsRes.data || [];


  return (
    <div className="container mx-auto p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Painel de Líderes</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo, <span className="font-semibold text-primary">{user.email}</span>!
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid gap-8">
          {isLeader && <ReferralLink userId={profile.id} />}
          {isLeader && <UpcomingEventsList events={events} leaderId={profile.id} />}
          {isLeader && <Leaderboard leaderStats={leaderStats} />}
          <SupportersList supporters={supporters} userId={isLeader ? profile.id : undefined} />
        </div>

        <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Mural de Avisos</h2>
            <div className="grid gap-6">
            {announcements.length > 0 ? (
                announcements.map((announcement) => (
                <Card key={announcement.id}>
                    <CardHeader>
                    <CardTitle className="text-lg">Comunicado</CardTitle>
                    <CardDescription>
                        {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                        })}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{announcement.content}</p>
                    </CardContent>
                </Card>
                ))
            ) : (
                <div className="p-8 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground">Nenhum aviso por enquanto.</p>
                </div>
            )}
            </div>
        </div>
      </main>
    </div>
); }