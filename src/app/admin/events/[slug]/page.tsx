import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardCheck, Users } from "lucide-react";

interface Registrant {
  supporter_name: string;
  supporter_region: string;
  leader_name: string | null;
}

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AdminEventDetailsPage({ params }: Props) {
  const { slug } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/painel');
  
  const { data: event } = await supabase
    .from("Events")
    .select("id, name, event_date")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  const { data: registrantsData, error } = await supabase.rpc('get_event_registrants_with_details', { p_event_slug: slug });

  if (error) {
    console.error("Erro ao buscar inscritos:", error);
  }

  const registrants = registrantsData as Registrant[] | null;

  const registrantsByLeader = registrants?.reduce((acc, registrant) => {
    const leader = registrant.leader_name || 'Inscrição Direta';
    if (!acc[leader]) {
      acc[leader] = 0;
    }
    acc[leader]++;
    return acc;
  }, {} as Record<string, number>) || {};

  const sortedLeaders = Object.entries(registrantsByLeader).sort((a, b) => b[1] - a[1]);

  return (
    <div className="container mx-auto p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Resumo de Inscrições
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-4">{registrants?.length || 0}</div>
                        <p className="text-sm text-muted-foreground">Total de apoiadores confirmados para o evento.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Mobilização por Líder
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2 text-sm">
                          {sortedLeaders.map(([leader, count]) => (
                            <li key={leader} className="flex justify-between items-center">
                              <span className="font-medium">{leader}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </li>
                          ))}
                       </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Lista de Inscritos</CardTitle>
                        <CardDescription>Todos os apoiadores que confirmaram presença neste evento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Apoiador</TableHead>
                                    <TableHead>Região</TableHead>
                                    <TableHead>Indicado por</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrants && registrants.length > 0 ? (
                                    registrants.map((r, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{r.supporter_name}</TableCell>
                                            <TableCell>{r.supporter_region || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={r.leader_name ? 'default' : 'outline'}>
                                                    {r.leader_name || 'Inscrição Direta'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">Nenhum apoiador inscrito ainda.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
); }