'use client';

import { useState, useRef, useEffect } from 'react';
import { updateUserCoreInfoByAdmin } from '@/lib/actions/user.actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

type User = {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  cpf: string | null;
};

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
    } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAction = async (formData: FormData) => {
    setPending(true);
    setMessage(null);
    
    const result = await updateUserCoreInfoByAdmin(formData);
    
    setMessage(result.message);
    setIsSuccess(result.success);
    
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    setPending(false);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
    >
        <Card 
          className="w-full max-w-md animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
            <form ref={formRef} action={handleAction}>
                <CardHeader className="py-4 space-y-2">
                    <CardTitle>Editar Usuário</CardTitle>
                    <CardDescription>Editando informações de {user.name}.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="authId" value={String(user.auth_id)} />
                    
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" defaultValue={user.email} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" name="cpf" type="text" defaultValue={user.cpf ?? ''} required />
                    </div>

                    {message && (
                        <div className={`text-sm font-medium p-3 rounded-md ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'}`}>
                            {message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={pending}>
                        {pending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
); }