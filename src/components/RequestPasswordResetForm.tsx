'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar Link de Recuperação'}
    </Button>
); }

export function RequestPasswordResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success) {
    return (
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verifique seu E-mail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </CardContent>
      </Card>
  ) }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu e-mail para receber um link de recuperação.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="lider@exemplo.com" required />
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