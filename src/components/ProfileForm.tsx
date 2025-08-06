'use client';

import { updateUserProfile } from '@/app/actions';
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
  name: string;
  email: string;
  phone_number: string;
  region_id: string;
  cpf: string | null;
  birth_date: string | null;
  occupation: string | null;
  motivation: string | null;
};

interface BaseData {
  id: string;
  name: string;
}

interface ProfileFormProps {
  user: UserProfile;
  regions: BaseData[];
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

  const formattedBirthDate = user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '';

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
                  <Input type="text" id="name" name="name" required defaultValue={user.name} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">E-mail (não pode ser alterado)</Label>
                    <Input type="email" id="email" name="email" disabled value={user.email} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="cpf">CPF (não pode ser alterado)</Label>
                    <Input type="text" id="cpf" name="cpf" disabled value={user.cpf ?? ''} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone_number">Telefone</Label>
                    <Input type="tel" id="phone_number" name="phone_number" required defaultValue={user.phone_number} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="region_id">Região Administrativa</Label>
                    <Select name="region_id" required defaultValue={user.region_id}>
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
                    <Input type="date" id="birth_date" name="birth_date" defaultValue={formattedBirthDate} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="occupation">Ocupação / Profissão</Label>
                    <Input type="text" id="occupation" name="occupation" defaultValue={user.occupation ?? ''} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="motivation">Motivação para ser Líder</Label>
                    <Textarea id="motivation" name="motivation" defaultValue={user.motivation ?? ''} />
                </div>
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