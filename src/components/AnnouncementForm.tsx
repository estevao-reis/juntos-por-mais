'use client';

import { sendAnnouncement } from "@/lib/actions/announcement.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar Aviso'}
    </Button>
); }

export function AnnouncementForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    const result = await sendAnnouncement(formData);
    if (result.success) {
      alert(result.message);
      formRef.current?.reset();
    } else {
      alert(result.message);
  } };

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4">
      <Textarea
        name="content"
        placeholder="Digite sua mensagem para todos os líderes aqui..."
        required
        rows={5}
      />
      <SubmitButton />
    </form>
); }