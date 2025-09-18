'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar Nova Senha'}
    </Button>
); }

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSessionReady(true);
    } });

    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if(data.session) {
            setIsSessionReady(true);
        } else {
             setTimeout(() => {
                if(window.location.hash && !isSessionReady) {
                    setError("O link de recuperação de senha é inválido ou expirou. Por favor, solicite um novo.");
                }
             }, 1500);
    }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, [isSessionReady]);

  if (error) {
     return (
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Erro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild>
            <Link href="/recuperar-senha">Solicitar Novo Link</Link>
          </Button>
        </CardContent>
      </Card>
  ) }

  if (state?.success) {
     return (
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button asChild>
            <Link href="/login">Ir para o Login</Link>
          </Button>
        </CardContent>
      </Card>
  ) }

  if (!isSessionReady && !error) {
     return (
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verificando...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aguarde enquanto validamos seu link de recuperação.</p>
        </CardContent>
      </Card>
  ) }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Crie sua Nova Senha</CardTitle>
        <CardDescription>
          Escolha uma senha segura com no mínimo 6 caracteres.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" type="password" name="password" required minLength={6} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" type="password" name="confirmPassword" required minLength={6} />
          </div>

          {state && !state.success && (
            <div className="text-sm font-medium text-destructive">
              {state.message}
            </div>
          )}
          <SubmitButton />
        </CardContent>
      </form>
    </Card>
); }