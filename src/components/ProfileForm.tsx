'use client';

import { updateUserProfile } from '@/lib/actions/user.actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  phone_number: string | null;
  region_id: string | null;
  cpf: string | null;
  birth_date: string | null;
  occupation: string | null;
  motivation: string | null;
  role?: 'ADMIN' | 'LEADER' | 'SUPPORTER';
};

interface BaseData {
  id: string;
  name: string;
}

interface ProfileFormProps {
  user: UserProfile;
  regions: BaseData[];
}

function formatDateForDisplay(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const dateInLocalTimezone = new Date(date.getTime() + userTimezoneOffset);

    const day = String(dateInLocalTimezone.getDate()).padStart(2, '0');
    const month = String(dateInLocalTimezone.getMonth() + 1).padStart(2, '0');
    const year = dateInLocalTimezone.getFullYear();
    return `${day}/${month}/${year}`;
}

function maskCPF(cpf: string | null): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return 'CPF pendente';

  return `***.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-**`;
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </Button>
); }

export function ProfileForm({ user, regions }: ProfileFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const formattedBirthDate = formatDateForDisplay(user.birth_date);
  const isAdmin = user.role === 'ADMIN';

  const handleFormAction = async (formData: FormData) => {
    const result = await updateUserProfile(formData);
    setMessage(result.message);
    setIsSuccess(result.success);
  };

  return (
    <Card>
      <CardContent className="p-8">
        <form ref={formRef} action={handleFormAction} className="grid gap-6">
            <input type="hidden" name="id" value={user.id} />
            <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input type="text" id="name" name="name" required defaultValue={user.name ?? ''} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">E-mail {isAdmin ? '(Editável)' : '(Não pode ser alterado)'}</Label>
                    <Input type="email" id="email" name="email" disabled={!isAdmin} defaultValue={user.email} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="cpf">CPF {isAdmin && '(Editável)'}</Label>
                    <Input type="text" id="cpf" name="cpf" disabled={!isAdmin} defaultValue={isAdmin ? (user.cpf ?? '') : maskCPF(user.cpf)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone_number">Telefone</Label>
                    <Input type="tel" id="phone_number" name="phone_number" required defaultValue={user.phone_number ?? ''} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="region_id">Região Administrativa</Label>
                    <Select name="region_id" required defaultValue={user.region_id ?? ''}>
                        <SelectTrigger id="region_id">
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
                 <div className="grid gap-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input 
                        type="text" 
                        id="birth_date" 
                        name="birth_date" 
                        placeholder="DD/MM/AAAA"
                        defaultValue={formattedBirthDate} 
                    />
                </div>
                {!isAdmin && (
                  <>
                    <div className="grid gap-2">
                        <Label htmlFor="occupation">Ocupação / Profissão</Label>
                        <Input type="text" id="occupation" name="occupation" defaultValue={user.occupation ?? ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="motivation">Motivação para ser Líder</Label>
                        <Textarea id="motivation" name="motivation" defaultValue={user.motivation ?? ''} />
                    </div>
                  </>
                )}
            </div>

            {message && (
            <div className={`text-sm font-medium text-center ${isSuccess ? 'text-green-600' : 'text-destructive'}`}>
                {message}
            </div>
            )}

            <SubmitButton />
        </form>
      </CardContent>
    </Card>
); }