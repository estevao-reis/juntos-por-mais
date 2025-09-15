"use client";

import { useState, useMemo } from "react";
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
import { deleteUserByAdmin, updateUserRole } from "@/lib/actions/user.actions";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Trash2, Search, Eye } from "lucide-react";
import { EditUserModal } from "./EditUserModal";
import { UserDetailsModal } from "./UserDetailsModal"; 
import { Input } from "./ui/input";

type User = {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  cpf: string | null;
  phone_number: string | null;
  role: "ADMIN" | "LEADER" | "SUPPORTER";
  region_name: string | null;
  created_at: string;
  birth_date: string | null;
  occupation: string | null;
  motivation: string | null;
};

type Region = {
    id: string;
    name: string;
}

interface UsersTableProps {
  users: User[];
  regions: Region[];
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

export function UsersTable({ users, regions }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        const matchesSearch = searchTerm === "" ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRegion = regionFilter === "all" || user.region_name === regionFilter;

        return matchesSearch && matchesRegion;
    });
  }, [users, searchTerm, regionFilter]);


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
      {viewingUser && (
        <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full md:w-[240px]">
                    <SelectValue placeholder="Filtrar por região" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Regiões</SelectItem>
                    {regions.map(region => (
                        <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Região</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="hidden md:table-cell">{user.region_name || "N/A"}</TableCell>
                <TableCell>
                  <RoleSwitcher userId={user.id} currentRole={user.role} />
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => setViewingUser(user)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver Detalhes</span>
                  </Button>
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
             {filteredUsers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum usuário encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
); }