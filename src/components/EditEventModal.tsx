'use client';

import { useEffect, useRef, useState } from 'react';
import { updateEvent } from '@/lib/actions/event.actions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';

type Event = {
  id: string;
  name: string;
  event_date: string;
  description: string | null;
  location: string | null;
};

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
}

export function EditEventModal({ event, onClose }: EditEventModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const eventDate = new Date(event.event_date);
  const formattedDate = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAction = async (formData: FormData) => {
    setPending(true);
    const result = await updateEvent(formData);
    setMessage(result.message);
    setIsSuccess(result.success);
    if (result.success) {
      setTimeout(() => onClose(), 1500);
    }
    setPending(false);
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <form ref={formRef} action={handleAction}>
          <CardHeader>
            <CardTitle>Editar Evento</CardTitle>
            <CardDescription>Ajuste as informações do evento abaixo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <input type="hidden" name="id" value={event.id} />
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Evento</Label>
              <Input id="name" name="name" defaultValue={event.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event_date">Data e Hora</Label>
              <Input id="event_date" name="event_date" type="datetime-local" defaultValue={formattedDate} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="location">Local do Evento</Label>
                <Input id="location" name="location" defaultValue={event.location ?? ''} placeholder="Ex: Salão Comunitário, Praça Central"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" defaultValue={event.description ?? ''} rows={4} />
            </div>
            {message && (
              <div className={`text-sm font-medium text-center p-2 rounded-md ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'}`}>
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
); }