'use client'

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signIn } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
); }

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Acesse sua conta para visualizar o painel.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="lider@exemplo.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <Link href="/recuperar-senha" className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required />
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