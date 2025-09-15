'use client';

import { registerPartner } from '@/lib/actions/user.actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BaseData {
  id: string;
  name: string;
}

interface RegistrationFormProps {
  leaders: BaseData[];
  regions: BaseData[];
  defaultLeaderId?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Quero Apoiar'}
    </Button>
); }

export function RegistrationForm({ leaders, regions, defaultLeaderId }: RegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const defaultLeader = leaders.find(l => l.id === defaultLeaderId);

  const handleFormAction = async (formData: FormData) => {
    const result = await registerPartner(formData);
    setMessage(result.message);
    setIsSuccess(result.success);
    if (result.success) {
      formRef.current?.reset();
  } };

  return (
    <form ref={formRef} action={handleFormAction} className="w-full max-w-lg mx-auto bg-card p-8 rounded-lg shadow-md">
      <div className="grid gap-6">
        {/* Bloco de Campos Obrigatórios */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input type="text" id="name" name="name" required placeholder="Seu nome" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input type="email" id="email" name="email" required placeholder="seu@email.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Telefone (com DDD)</Label>
            <Input type="tel" id="phone_number" name="phone_number" required placeholder="(61) 99999-9999" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region_id">Região Administrativa</Label>
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
        </div>

        {/* Bloco de Campos Opcionais */}
        <div className="border-t pt-6 grid gap-4">
            <p className="text-sm text-muted-foreground -mt-2">
                Os campos abaixo são opcionais, mas nos ajudam a te convidar para eventos e oportunidades exclusivas!
            </p>
             {defaultLeader ? (
               <div className="grid gap-2">
                  <Label htmlFor="leader">Você foi indicado por</Label>
                  <Input type="text" id="leaderName" name="leaderName" disabled value={defaultLeader.name} />
                  <input type="hidden" name="leader" value={defaultLeader.id} />
               </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="leader">Quem te indicou? (Opcional)</Label>
                <Select name="leader">
                  <SelectTrigger id="leader" className="w-full">
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input type="text" id="birth_date" name="birth_date" placeholder="DD/MM/AAAA" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="occupation">Ocupação</Label>
              <Input type="text" id="occupation" name="occupation" placeholder="Ex: artesão, estudante, autônomo..." />
            </div>
        </div>

        {message && (
          <div className={`text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-destructive'}`}>
            {message}
          </div>
        )}

        <SubmitButton />
      </div>
    </form>
); }