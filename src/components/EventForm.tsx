'use client';

import { createEvent } from "@/lib/actions/event.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Criando...' : 'Criar Evento'}
    </Button>
); }

export function EventForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    const result = await createEvent(formData);
    if (result.success) {
      alert(result.message);
      formRef.current?.reset();
    } else {
      alert(`Erro: ${result.message}`);
  } };

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Evento</Label>
        <Input id="name" name="name" placeholder="Ex: Encontro de Líderes em Taguatinga" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="event_date">Data e Hora do Evento</Label>
        <Input id="event_date" name="event_date" type="datetime-local" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Local do Evento</Label>
        <Input id="location" name="location" placeholder="Ex: Salão Comunitário, Praça Central" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição do Evento</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descreva o objetivo e outras informações importantes sobre o evento."
          rows={4}
        />
      </div>
      <SubmitButton />
    </form>
); }