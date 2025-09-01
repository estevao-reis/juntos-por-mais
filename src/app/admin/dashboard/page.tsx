import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Calendar, ClipboardCheck } from "lucide-react";

interface LeaderStats {
  leader_id: string;
  leader_name: string;
  partner_count: number;
}

interface DashboardInsight {
  total_supporters: number;
  total_leaders: number;
  total_events: number;
  total_registrations: number;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('Users')
    .select('role')
    .eq('auth_id', user.id)
    .single();

  if (profileError || profile?.role !== 'ADMIN') {
    redirect('/painel');
  }

  const [leaderDataRes, insightsRes] = await Promise.all([
    supabase.rpc('get_leader_partner_counts'),
    supabase.rpc('get_dashboard_insights').single()
  ]);

  if (leaderDataRes.error) {
    console.error("Erro ao buscar dados dos líderes:", leaderDataRes.error);
  }
   if (insightsRes.error) {
    console.error("Erro ao buscar insights do dashboard:", insightsRes.error);
  }

  const leaderData = (leaderDataRes.data as LeaderStats[]) || [];
  const insights = insightsRes.data as DashboardInsight | null;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Administrador</h1>
        <p className="text-muted-foreground mt-2">Visão geral da sua rede de apoiadores e eventos.</p>
      </div>

      {insights && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Apoiadores</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_supporters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Líderes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_leaders}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Criados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_events}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscrições em Eventos</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.total_registrations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Líderes</CardTitle>
          <CardDescription>Apoiadores cadastrados por cada líder da rede.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Líder</TableHead>
                <TableHead className="text-right">Apoiadores Cadastrados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderData && leaderData.length > 0 ? (
                leaderData.map((leader: LeaderStats) => (
                  <TableRow key={leader.leader_id}>
                    <TableCell className="font-medium">{leader.leader_name}</TableCell>
                    <TableCell className="text-right text-lg font-bold">{leader.partner_count}</TableCell>
                  </TableRow>
              )) ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Nenhum líder encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
); }