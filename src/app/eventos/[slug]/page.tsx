'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info, MapPin } from "lucide-react";

type EventDetails = {
  id: string;
  name: string;
  event_date: string;
  description: string | null;
  location: string | null;
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
    return null;
  }

  const dateString = new Date(event.event_date).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
  const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return (
    <section className="py-20 bg-muted/40 min-h-screen flex items-center">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <div className="order-2 lg:order-1">
          <EventRegistrationForm eventId={event.id} regions={regions} />
        </div>

        <div className="order-1 lg:order-2">
            <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {event.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Sobre o Evento</p>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {event.description || "Mais informações sobre o evento serão divulgadas em breve."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Data e Horário</p>
                                <p className="text-muted-foreground">
                                    {formattedDate}
                                </p>
                            </div>
                        </div>

                        {event.location && (
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                            <p className="font-semibold">Local</p>
                            <p className="text-muted-foreground">{event.location}</p>
                            </div>
                        </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </section>
); }