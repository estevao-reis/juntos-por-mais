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
import { deleteUserByAdmin, updateUserRole } from "@/app/actions";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditUserModal } from "./EditUserModal";

type User = {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  cpf: string | null;
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
      }
    }
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`)) {
      setIsDeleting(user.id);
      const result = await deleteUserByAdmin(user.id, user.auth_id);
      alert(result.message);
      setIsDeleting(null);
  } };

  return (
    <>
      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              {/* Coluna Região oculta em telas pequenas (mobile) */}
              <TableHead className="hidden md:table-cell">Região</TableHead>
              {/* Coluna Data de Cadastro oculta em telas pequenas e médias */}
              <TableHead className="hidden lg:table-cell">Data de Cadastro</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                {/* Célula Região oculta em telas pequenas (mobile) */}
                <TableCell className="hidden md:table-cell">{user.region_name || "N/A"}</TableCell>
                {/* Célula Data de Cadastro oculta em telas pequenas e médias */}
                <TableCell className="hidden lg:table-cell">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <RoleSwitcher userId={user.id} currentRole={user.role} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user)}
                    disabled={isDeleting === user.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
); }