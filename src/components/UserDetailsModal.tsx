'use client';

import { useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { X, User, Mail, Phone, MapPin, BadgeInfo, Calendar, Briefcase, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

type User = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: "ADMIN" | "LEADER" | "SUPPORTER";
  region_name: string | null;
  created_at: string;
  birth_date: string | null;
  occupation: string | null;
  motivation: string | null;
};

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Não informado';
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const dateInLocalTimezone = new Date(date.getTime() + userTimezoneOffset);
    return dateInLocalTimezone.toLocaleDateString('pt-BR');
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
    } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);


  const DetailItem = ({ icon: Icon, label, value, isBadge = false, valueClassName = "" }: 
    { icon: React.ElementType, label: string, value: string | null, isBadge?: boolean, valueClassName?: string }) => (
    value ? (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                {isBadge ? <Badge variant="secondary">{value}</Badge> : <p className={`text-base text-foreground ${valueClassName}`}>{value}</p>}
            </div>
        </div>
    ) : null
  );

  return (
    <div 
      className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in-0"
      onClick={onClose}
    >
        <Card 
          className="w-full max-w-lg lg:max-w-2xl animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
            <CardHeader className="py-4 space-y-2">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>Detalhes do perfil do usuário.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem icon={BadgeInfo} label="Função" value={user.role} isBadge />
                    <DetailItem icon={Mail} label="E-mail" value={user.email} valueClassName="break-words" />
                    <DetailItem icon={Phone} label="Telefone" value={user.phone_number} />
                    <DetailItem icon={MapPin} label="Região" value={user.region_name} />
                    <DetailItem icon={Calendar} label="Data de Nascimento" value={formatDate(user.birth_date)} />
                    <DetailItem icon={Briefcase} label="Ocupação" value={user.occupation} />
                </div>
                {user.motivation && (
                    <div className="border-t pt-4">
                        <DetailItem 
                            icon={Sparkles} 
                            label="Motivação para Liderar" 
                            value={user.motivation} 
                            valueClassName="whitespace-pre-wrap break-words"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            </CardFooter>
        </Card>
    </div>
); }