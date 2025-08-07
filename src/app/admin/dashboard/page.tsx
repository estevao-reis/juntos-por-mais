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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface LeaderStats {
  leader_id: string;
  leader_name: string;
  partner_count: number;
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

  const { data: leaderData, error: rpcError } = await supabase.rpc('get_leader_partner_counts');

  if (rpcError) {
    console.error("Erro ao buscar dados do dashboard:", rpcError);
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Administrador</h1>
        <div className="flex items-center gap-2">
            <Link href="/admin/announcements">
              <Button>Gerenciar Avisos</Button>
            </Link>
            <Link href="/admin/usuarios">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Usuários
              </Button>
            </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Líderes</CardTitle>
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