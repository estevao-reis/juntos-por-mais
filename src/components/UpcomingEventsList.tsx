'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Copy, Check, Calendar, Users, UserCheck } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsappIcon';

type EventStat = {
  event_id: string;
  event_name: string;
  event_slug: string;
  event_date: string;
  total_registrations: number;
  my_registrations: number;
};

interface UpcomingEventsListProps {
  events: EventStat[];
  leaderId: string;
}

export function UpcomingEventsList({ events, leaderId }: UpcomingEventsListProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const getReferralLink = (eventSlug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/eventos/${eventSlug}?ref=${leaderId}`;
  };

  const handleCopy = (eventSlug: string) => {
    const referralLink = getReferralLink(eventSlug);
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopiedLink(eventSlug);
      setTimeout(() => setCopiedLink(null), 2000);
  }); };

  const handleWhatsAppShare = (eventName: string, eventSlug: string) => {
    const referralLink = getReferralLink(eventSlug);
    const message = encodeURIComponent(`Olá! Participe do nosso próximo evento: "${eventName}". Confirme sua presença pelo meu link de convite: ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
        <CardDescription>
          Compartilhe o link do evento e acompanhe os inscritos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {events && events.length > 0 ? (
            events.map((event) => (
              <div key={event.event_id} className="p-4 border rounded-lg space-y-4">
                <div>
                  <h3 className="font-semibold">{event.event_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.event_date).toLocaleString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Sao_Paulo'
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    <span>Total: <span className="font-bold text-foreground">{event.total_registrations}</span></span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCheck className="size-4 text-primary" />
                    <span>Seus indicados: <span className="font-bold text-primary">{event.my_registrations}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => handleCopy(event.event_slug)} size="sm" variant="outline">
                      {copiedLink === event.event_slug ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copiedLink === event.event_slug ? 'Copiado!' : 'Copiar Link'}
                    </Button>
                    <Button onClick={() => handleWhatsAppShare(event.event_name, event.event_slug)} size="sm" className="bg-[#25D366] hover:bg-[#25D366]/90">
                        <WhatsAppIcon className="mr-2 h-4 w-4 text-white" />
                        Compartilhar
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">Nenhum evento programado no momento.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
); }