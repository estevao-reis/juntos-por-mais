'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/EventForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deleteEvent } from '@/lib/actions/event.actions';
import { EditEventModal } from '@/components/EditEventModal';

type Event = {
  id: string;
  name: string;
  slug: string;
  event_date: string;
  description: string | null;
  location: string | null;
  created_at: string;
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Events' }, (payload) => {
        fetchEvents();
      })
      .subscribe();

    async function fetchEvents() {
      const { data } = await supabase.from('Events').select('*').order('event_date', { ascending: false });
      setEvents(data as Event[] || []);
    }

    fetchEvents();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      const result = await deleteEvent(eventId);
      alert(result.message);
      if (result.success) {
        setEvents(events.filter(event => event.id !== eventId));
  } } };

  return (
    <>
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
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
                                          <TableCell>{new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                                          <TableCell className="text-right space-x-2">
                                              <Link href={`/admin/events/${event.slug}`}>
                                                  <Button variant="outline" size="sm">
                                                      <Eye className="mr-2 h-4 w-4" />
                                                      Inscritos
                                                  </Button>
                                              </Link>
                                              <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)}>
                                                  <Pencil className="mr-2 h-4 w-4" />
                                                  Editar
                                              </Button>
                                              <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Excluir
                                              </Button>
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
    </>
); }