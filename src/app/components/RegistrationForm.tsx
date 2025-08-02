'use client';

import { registerPartner } from '@/app/actions';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Leader {
  id: string;
  name: string;
}

interface RegistrationFormProps {
  leaders: Leader[];
}

export function RegistrationForm({ leaders }: RegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);


  const handleFormAction = async (formData: FormData) => {
    const result = await registerPartner(formData);
    if (result.success) {
      alert(result.message);
      formRef.current?.reset();
      if (selectTriggerRef.current) {
        selectTriggerRef.current.textContent = "Selecione um líder";
      }
    } else {
      alert(result.message);
  } };

  return (
    <form ref={formRef} action={handleFormAction} className="w-full max-w-lg mx-auto bg-card p-8 rounded-lg shadow-md">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="leader">Quem te indicou?</Label>
          <Select name="leader" required>
            <SelectTrigger ref={selectTriggerRef} id="leader" className="w-full">
              <SelectValue placeholder="Selecione um líder" />
            </SelectTrigger>
            <SelectContent>
              {leaders.map((leader) => (
                <SelectItem key={leader.id} value={leader.id.toString()}>
                  {leader.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Seu Nome Completo</Label>
          <Input type="text" id="name" name="name" required placeholder="John Doe" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Seu Melhor E-mail</Label>
          <Input type="email" id="email" name="email" required placeholder="john.doe@example.com" />
        </div>

        <Button type="submit" className="w-full">
          Cadastrar
        </Button>
      </div>
    </form>
); }