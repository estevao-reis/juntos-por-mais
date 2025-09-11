import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown } from "lucide-react";

type LeaderStat = {
  leader_id: string;
  leader_name: string;
  partner_count: number;
};

interface LeaderboardProps {
  leaderStats: LeaderStat[];
}

export function Leaderboard({ leaderStats }: LeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Líderes</CardTitle>
        <CardDescription>
          Líderes que mais cadastraram apoiadores na rede.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos.</TableHead>
                <TableHead>Nome do Líder</TableHead>
                <TableHead className="text-right">Apoiadores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderStats.map((leader, index) => (
                <TableRow key={leader.leader_id}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="size-5 text-yellow-500" />}
                      {index === 1 && <Crown className="size-5 text-gray-400" />}
                      {index === 2 && <Crown className="size-5 text-orange-400" />}
                      {index > 2 && <span>{index + 1}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{leader.leader_name}</TableCell>
                  <TableCell className="text-right text-lg font-bold">{leader.partner_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
); }