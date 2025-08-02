'use client'

import { signIn } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState, useFormStatus } from "react-dom";

export function LoginForm() {
  const [state, dispatch] = useFormState(signIn, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Acesse sua conta para visualizar o painel.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="lider@exemplo.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" name="password" required />
          </div>

          {state?.message && (
            <div className="text-sm font-medium text-destructive">
              {state.message}
            </div>
          )}
          <LoginButton />
        </CardContent>
      </form>
    </Card>
); }

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" aria-disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
); }