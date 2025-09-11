'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { WhatsAppIcon } from './icons/WhatsappIcon';

interface ReferralLinkProps {
  userId: string;
}

export function ReferralLink({ userId }: ReferralLinkProps) {
  const [referralLink, setReferralLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setReferralLink(`${origin}/?ref=${userId}`);
  }, [userId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  }); };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Olá! Quero te convidar para apoiar essa causa. Cadastre-se através do meu link: ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Link de Convite</CardTitle>
        <CardDescription>
          Compartilhe este link para que novos apoiadores se cadastrem através da sua indicação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="grid w-full gap-2">
            <Label htmlFor="referral-link" className="sr-only">
              Link de Convite
            </Label>
            <Input id="referral-link" value={referralLink} readOnly />
          </div>
          <Button size="icon" onClick={handleCopy} disabled={!referralLink} variant="outline">
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copiar Link</span>
          </Button>
          <Button size="icon" onClick={handleWhatsAppShare} disabled={!referralLink} className="bg-[#25D366] hover:bg-[#25D366]/90">
            <WhatsAppIcon className="h-4 w-4 text-white" />
            <span className="sr-only">Compartilhar no WhatsApp</span>
          </Button>
        </div>
      </CardContent>
    </Card>
); }