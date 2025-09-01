'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Copy, Check, Calendar } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsappIcon';

type Event = {
  id: string;
  name: string;
  slug: string;
  event_date: string;
};

interface UpcomingEventsListProps {
  events: Event[];
  leaderId: string;
}

export function UpcomingEventsList({ events, leaderId }: UpcomingEventsListProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const getReferralLink = (eventSlug: string) => {
    const origin = window.location.origin;
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
          Compartilhe o link do evento para que seus apoiadores confirmem presença através da sua indicação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleCopy(event.slug)} size="sm" variant="outline">
                    {copiedLink === event.slug ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiedLink === event.slug ? 'Copiado!' : 'Copiar Link'}
                    </Button>
                    <Button onClick={() => handleWhatsAppShare(event.name, event.slug)} size="sm" className="bg-[#25D366] hover:bg-[#25D366]/90">
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