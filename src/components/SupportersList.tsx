'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { Button } from './ui/button';
import { Eye } from 'lucide-react';
import { UserDetailsModal } from './UserDetailsModal';
import { ReferralLink } from "./ReferralLink";

type Supporter = {
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
    cpf: string | null;
};

interface SupportersListProps {
  supporters: Supporter[];
  userId?: string;
}

export function SupportersList({ supporters, userId }: SupportersListProps) {
  const [viewingUser, setViewingUser] = useState<Supporter | null>(null);

  return (
    <>
      {viewingUser && (
        <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seus Apoiadores Indicados</CardTitle>
          <CardDescription>
            Esta é a lista de pessoas que se cadastraram utilizando o seu link de convite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supporters && supporters.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead className="hidden md:table-cell">Data do Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supporters.map((supporter) => (
                    <TableRow key={supporter.id}>
                      <TableCell className="font-medium">{supporter.name}</TableCell>
                      <TableCell>
                          <Badge variant="outline">{supporter.region_name}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(supporter.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewingUser(supporter)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver Detalhes de {supporter.name}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            userId ? (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não indicou nenhum apoiador. Compartilhe seu link abaixo!
                </p>
                <ReferralLink userId={userId} />
              </div>
            ) : (
              <div className="mt-4 p-8 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground">Nenhum apoiador indicado.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </>
); }