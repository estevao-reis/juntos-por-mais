'use client';

import { registerForEvent } from '@/lib/actions/event.actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/lib/supabase/client';

interface BaseData {
  id: string;
  name: string;
}

interface EventRegistrationFormProps {
  eventId: string;
  regions: BaseData[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Confirmando...' : 'Confirmar Presença'}
    </Button>
); }

export function EventRegistrationForm({ eventId, regions }: EventRegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const leaderRefId = searchParams.get('ref') || null;

  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    const result = await registerForEvent(formData);
    setMessage(result.message);
    setIsSuccess(result.success);
    if (result.success) {
      formRef.current?.reset();
    }
  };

  const checkUser = async (email: string) => {
    if (!email || !email.includes('@')) {
      setIsExistingUser(null);
      return;
    }
    setCheckingUser(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('Users').select('id').eq('email', email).single();
    setIsExistingUser(!!data && !error);
    setCheckingUser(false);
  };

  return (
    <form ref={formRef} action={handleFormAction} className="w-full bg-card p-8 rounded-lg shadow-md border">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="leader_id" value={leaderRefId || ''} />
      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Seu Melhor E-mail</Label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              placeholder="seu@email.com"
              onBlur={(e) => checkUser(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usaremos este e-mail para confirmar sua presença. Se você já é nosso apoiador, use o mesmo e-mail.
            </p>
          </div>

          {checkingUser && <p className="text-sm text-muted-foreground">Verificando e-mail...</p>}

          {isExistingUser === false && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input type="text" id="name" name="name" required placeholder="Seu nome completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone_number">Telefone (com DDD)</Label>
                <Input type="tel" id="phone_number" name="phone_number" required placeholder="(61) 99999-9999" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region_id">Sua Região Administrativa</Label>
                <Select name="region_id" required>
                  <SelectTrigger id="region_id" className="w-full">
                    <SelectValue placeholder="Selecione sua RA" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {message && (
          <div className={`text-sm font-medium p-3 rounded-md text-center ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'}`}>
            {message}
          </div>
        )}

        <SubmitButton />
      </div>
    </form>
); }