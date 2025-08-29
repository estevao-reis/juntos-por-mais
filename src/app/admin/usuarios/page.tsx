import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/UsersTable";
import { getUsersWithRoles } from "@/app/actions";

export default async function ManageUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("auth_id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/painel");

  const users = await getUsersWithRoles();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Promova líderes a administradores ou gerencie perfis. Lembre-se que certas ações não podem ser desfeitas.
          </p>
        </div>
      </div>

      <UsersTable users={users} />
    </div>
); }