"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function sendAnnouncement(
  formData: FormData
): Promise<ActionResult> {
  const content = formData.get("content") as string;
  if (!content) {
    return {
      success: false,
      message: "O conteúdo do aviso não pode estar vazio.",
  }; }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const { data: profile, error: profileError } = await supabase
    .from('Users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, message: "Não foi possível encontrar o perfil do usuário." };
  }

  if (profile.role !== 'ADMIN') {
      return { success: false, message: "Acesso negado. Permissão de administrador necessária." };
  }

  const announcementData = {
    content,
    author_id: profile.id,
    target_audience: "ALL_LEADERS",
  };

  const { error } = await supabase
    .from("Announcements")
    .insert(announcementData);
  if (error) {
    console.error("Erro ao enviar aviso:", error);
    return {
      success: false,
      message: `Falha ao enviar aviso: ${error.message}`,
  }; }

  revalidatePath("/admin/announcements");
  revalidatePath("/painel");
  return { success: true, message: "Aviso enviado com sucesso!" };
}

export async function updateAnnouncement(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado: Usuário não autenticado." };

  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (profile?.role !== "ADMIN")
    return { success: false, message: "Acesso negado: Permissão de administrador necessária." };

  const id = formData.get("id") as string;
  const content = formData.get("content") as string;

  if (!content) {
    return { success: false, message: "O conteúdo não pode estar vazio." };
  }

  const { error } = await supabase
    .from("Announcements")
    .update({ content })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar aviso:", error);
    return { success: false, message: `Falha ao atualizar: ${error.message}` };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/painel");
  return { success: true, message: "Aviso atualizado com sucesso!" };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado: Usuário não autenticado." };

  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  if (profile?.role !== "ADMIN")
    return { success: false, message: "Acesso negado: Permissão de administrador necessária." };

  const { error } = await supabase.from("Announcements").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir aviso:", error);
    return { success: false, message: `Falha ao excluir: ${error.message}` };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/painel");
  return { success: true, message: "Aviso excluído com sucesso!" };
}