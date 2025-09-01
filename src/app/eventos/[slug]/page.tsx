'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";

type EventDetails = {
  id: string;
  name: string;
  event_date: string;
  description: string | null;
};

type Region = {
  id: string;
  name: string;
};

export default function EventPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const supabase = createClient();

    async function fetchData() {
      setLoading(true);
      setError(null);

      const [eventResponse, regionsResponse] = await Promise.all([
        supabase.from('Events').select('*').eq('slug', slug).single(),
        supabase.from('AdministrativeRegions').select('id, name').order('name')
      ]);

      if (eventResponse.error || !eventResponse.data) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }
      setEvent(eventResponse.data);

      if (regionsResponse.error) {
        console.error("Erro ao buscar RAs:", regionsResponse.error);
      }
      setRegions(regionsResponse.data || []);

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Carregando evento...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-destructive">{error}</div>;
  }

  if (!event) {
    return null; // ou uma mensagem de "evento não encontrado"
  }

  return (
    <section className="py-20 bg-muted/40 min-h-screen flex items-center">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <div className="order-2 lg:order-1">
          <EventRegistrationForm eventId={event.id} regions={regions} />
        </div>

        <div className="order-1 lg:order-2">
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight">{event.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.event_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert text-muted-foreground whitespace-pre-wrap">
                        <Info className="inline-block mr-2 h-4 w-4" />
                        {event.description || "Mais informações sobre o evento serão divulgadas em breve."}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </section>
); }