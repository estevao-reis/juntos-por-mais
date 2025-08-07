import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { ReferralLink } from "./ReferralLink";

type Supporter = {
    id: string;
    name: string;
    email: string;
    created_at: string;
    region_name: string;
};

interface SupportersListProps {
  supporters: Supporter[];
  userId?: string;
}

export function SupportersList({ supporters, userId }: SupportersListProps) {
  return (
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
                  <TableHead>Data do Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supporters.map((supporter) => (
                  <TableRow key={supporter.id}>
                    <TableCell className="font-medium">{supporter.name}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{supporter.region_name}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(supporter.created_at).toLocaleDateString('pt-BR')}
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
); }