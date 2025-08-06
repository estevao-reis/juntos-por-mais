"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/app/actions";
import { Badge } from "./ui/badge";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LEADER" | "SUPPORTER";
  region_name: string | null;
  created_at: string;
};

interface UsersTableProps {
  users: User[];
}

function RoleSwitcher({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: User["role"];
}) {
  const [role, setRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: "ADMIN" | "LEADER") => {
    setIsLoading(true);
    const confirmation = confirm(
      `Tem certeza que deseja alterar a função deste usuário para ${newRole}?`
    );
    if (confirmation) {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setRole(newRole);
        alert(result.message);
      } else {
        alert(`Erro: ${result.message}`);
    } }
    setIsLoading(false);
  };

  if (currentRole === "SUPPORTER") {
    return <Badge variant="secondary">Apoiador</Badge>;
  }

  return (
    <Select
      value={role}
      onValueChange={(newRole) =>
        handleRoleChange(newRole as "ADMIN" | "LEADER")
      }
      disabled={isLoading}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LEADER">Líder</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
); }

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Região</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Função</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.region_name || "N/A"}</TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-right">
                <RoleSwitcher userId={user.id} currentRole={user.role} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
); }