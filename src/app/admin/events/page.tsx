import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/EventForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

export default async function ManageEventsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') redirect('/painel');

  const { data: events } = await supabase.from('Events').select('*').order('event_date', { ascending: false });

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Eventos</h1>
          <p className="text-muted-foreground mt-2">Crie e acompanhe os eventos da sua rede.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Evento</CardTitle>
              <CardDescription>Preencha os detalhes abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <EventForm />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Eventos Criados</h2>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome do Evento</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events && events.length > 0 ? (
                                events.map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.name}</TableCell>
                                        <TableCell>{new Date(event.event_date).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/events/${event.slug}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver Inscritos
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Nenhum evento criado.</TableCell>
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