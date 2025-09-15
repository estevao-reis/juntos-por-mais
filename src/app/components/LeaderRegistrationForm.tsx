'use client';

import { signUpLeader } from '@/lib/actions/auth.actions';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface BaseData {
  id: string;
  name: string;
}

interface LeaderRegistrationFormProps {
  regions: BaseData[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Cadastre-se como Líder'}
    </Button>
); }

export function LeaderRegistrationForm({ regions }: LeaderRegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cpfError, setCpfError] = useState<string | null>(null);

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    const digits = cpf.split("").map(Number);
    const validator = (n: number) =>
      ((digits
        .slice(0, n)
        .reduce((sum, digit, index) => sum + digit * (n + 1 - index), 0) *
        10) %
        11) %
      10;
    return validator(9) === digits[9] && validator(10) === digits[10];
  }

  const handleCpfBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cpf = e.target.value;
    if (cpf && !validateCPF(cpf)) {
        setCpfError("CPF inválido.");
    } else {
        setCpfError(null);
    }
  }

  const handleFormAction = async (formData: FormData) => {
    const result = await signUpLeader(formData);
    setMessage(result.message);
    setIsSuccess(result.success);
    if (result.success) {
      formRef.current?.reset();
  } };

  return (
    <form ref={formRef} action={handleFormAction} className="w-full max-w-lg mx-auto bg-card p-8 rounded-lg shadow-md">
      <div className="grid gap-6">
        {/* Bloco Obrigatório */}
        <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Informações Essenciais</h3>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input type="text" id="name" name="name" required placeholder="Seu nome completo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input type="text" id="cpf" name="cpf" required placeholder="000.000.000-00" onBlur={handleCpfBlur} />
              {cpfError && <p className="text-sm text-destructive">{cpfError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail para Login</Label>
              <Input type="email" id="email" name="email" required placeholder="seu@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Crie uma Senha</Label>
              <Input type="password" id="password" name="password" required minLength={6} placeholder="Mínimo de 6 caracteres" />
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
        </div>

        {/* Bloco Opcional */}
        <div className="border-t pt-6 grid gap-4">
            <h3 className="font-semibold text-lg">Informações Adicionais</h3>
            <p className="text-sm text-muted-foreground -mt-2">
                Conte-nos mais sobre você para personalização.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input type="text" id="birth_date" name="birth_date" placeholder="DD/MM/AAAA" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="occupation">Ocupação</Label>
                <Input type="text" id="occupation" name="occupation" placeholder="Ex: Líder comunitário, empresário..." />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="motivation">Motivação para ser Líder</Label>
                <Textarea id="motivation" name="motivation" placeholder="O que te inspira a liderar em sua comunidade?" />
            </div>
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