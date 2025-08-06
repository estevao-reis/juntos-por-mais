"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ActionResult = {
  success: boolean;
  message: string;
};

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const digits = cpf.split("").map(Number);
  const validator = (n: number) =>
    ((digits
      .slice(0, n)
      .reduce((sum, digit, index) => sum + digit * (n + 1 - index), 0) *
      10) %
      11) %
    10;
  return validator(9) === digits[9] && validator(10) === digits[10];
}

export async function registerPartner(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const partnerData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone_number: formData.get("phone_number") as string,
    region_id: formData.get("region_id") as string,
    leader_id: (formData.get("leader") as string) || null,
    birth_date: (formData.get("birth_date") as string) || null,
    occupation: (formData.get("occupation") as string) || null,
    role: "SUPPORTER" as const,
  };

  if (
    !partnerData.name ||
    !partnerData.email ||
    !partnerData.phone_number ||
    !partnerData.region_id
  ) {
    return {
      success: false,
      message: "Por favor, preencha todos os campos obrigatórios.",
  }; }

  const { error } = await supabase.from("Users").insert(partnerData);

  if (error) {
    console.error("Erro ao cadastrar apoiador:", error);
    return { success: false, message: `Falha ao cadastrar: ${error.message}` };
  }
  revalidatePath("/");
  return {
    success: true,
    message: "Cadastro realizado com sucesso! Obrigado por seu apoio.",
}; }

export async function signUpLeader(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Nome, e-mail e senha são obrigatórios.",
  }; }
  if (password.length < 6) {
    return {
      success: false,
      message: "A senha deve ter no mínimo 6 caracteres.",
  }; }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
  }, }, });

  if (error) {
    return { success: false, message: `Falha ao cadastrar: ${error.message}` };
  }

  if (data.user?.identities?.length === 0) {
    return {
      success: false,
      message: "Este e-mail já está em uso por outro método de login.",
  }; }

  revalidatePath("/seja-um-lider");
  return {
    success: true,
    message:
      "Cadastro realizado com sucesso! Verifique seu e-mail para confirmação e complete seu perfil após o login.",
}; }

export async function signIn(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    return { success: false, message: "Credenciais inválidas." };
  }

  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return redirect("/login");
}

export async function sendAnnouncement(
  formData: FormData
): Promise<ActionResult> {
  const content = formData.get("content") as string;
  if (!content) {
    return {
      success: false,
      message: "O conteúdo do aviso não pode estar vazio.",
    };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Usuário não autenticado." };
  }
  const announcementData = {
    content,
    author_id: user.id,
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
    };
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/painel");
  return { success: true, message: "Aviso enviado com sucesso!" };
}

export async function updateAnnouncement(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado." };
  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN")
    return { success: false, message: "Acesso negado." };

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado." };
  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN")
    return { success: false, message: "Acesso negado." };

  const { error } = await supabase.from("Announcements").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir aviso:", error);
    return { success: false, message: `Falha ao excluir: ${error.message}` };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/painel");
  return { success: true, message: "Aviso excluído com sucesso!" };
}

export async function updateUserProfile(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "Usuário não autenticado. Acesso negado.",
  }; }

  const profileId = formData.get("id") as string;

  if (user.id !== profileId) {
    return {
      success: false,
      message: "Você não tem permissão para editar este perfil.",
  }; }

  const cpf = formData.get("cpf") as string;
  if (!validateCPF(cpf)) {
    return { success: false, message: "CPF inválido." };
  }

  const profileData = {
    name: formData.get("name") as string,
    phone_number: formData.get("phone_number") as string,
    region_id: formData.get("region_id") as string,
    cpf,
    birth_date: (formData.get("birth_date") as string) || null,
    occupation: (formData.get("occupation") as string) || null,
    motivation: (formData.get("motivation") as string) || null,
  };

  const { error } = await supabase
    .from("Users")
    .update(profileData)
    .eq("id", profileId);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return {
      success: false,
      message: `Falha ao salvar alterações: ${error.message}`,
  }; }

  revalidatePath("/painel/perfil");
  revalidatePath("/", "layout");

  return { success: true, message: "Perfil atualizado com sucesso!" };
}

export async function getUsersWithRoles() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") return [];

  const { data, error } = await supabase
    .from("Users")
    .select(
      `
            id,
            name,
            email,
            role,
            created_at,
            region:AdministrativeRegions!inner(name)
        `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }

  return data.map((u) => ({
    ...u,
    // @ts-ignore
    region_name: u.region.name ?? null,
})); }

export async function updateUserRole(
  userId: string,
  newRole: "ADMIN" | "LEADER"
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();
  if (!adminUser) {
    return { success: false, message: "Acesso negado." };
  }
  const { data: adminProfile } = await supabase
    .from("Users")
    .select("role")
    .eq("id", adminUser.id)
    .single();
  if (adminProfile?.role !== "ADMIN") {
    return {
      success: false,
      message: "Você não tem permissão para realizar esta ação.",
  }; }

  const { error } = await supabase
    .from("Users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Erro ao atualizar a role:", error);
    return {
      success: false,
      message: "Não foi possível atualizar a função do usuário.",
  }; }

  revalidatePath("/admin/usuarios");
  return {
    success: true,
    message: "Função do usuário atualizada com sucesso!",
}; }

export async function updateAvatarUrl(newUrl: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const { error } = await supabase
    .from('Users')
    .update({ profile_picture_url: newUrl })
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar URL do avatar:', error);
    return { success: false, message: 'Não foi possível salvar a nova foto.' };
  }

  revalidatePath('/painel/perfil');
  revalidatePath('/', 'layout');

  return { success: true, message: 'Foto de perfil atualizada.' };
}

export async function getReferredSupporters() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('Users')
    .select('id, name, email, created_at, region:AdministrativeRegions(name)')
    .eq('leader_id', user.id)
    .eq('role', 'SUPPORTER')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar apoiadores indicados:', error);
    return [];
  }
    
  return data.map(u => ({
    ...u,
    // @ts-ignore
    region_name: u.region.name ?? 'N/A'
})); }

export async function removeAvatar(): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('Users')
    .select('profile_picture_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.profile_picture_url) {
    return { success: false, message: 'Nenhuma foto de perfil para remover.' };
  }
  
  const filePath = profile.profile_picture_url.split('/avatars/')[1];

  const { error: storageError } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (storageError) {
    console.error('Erro ao remover avatar do Storage:', storageError);
    return { success: false, message: 'Não foi possível remover o arquivo da foto.' };
  }
  
  const { error: updateError } = await supabase
    .from('Users')
    .update({ profile_picture_url: null })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Erro ao limpar URL do avatar:', updateError);
    return { success: false, message: 'Não foi possível atualizar o perfil.' };
  }

  revalidatePath('/painel/perfil');
  revalidatePath('/', 'layout');

  return { success: true, message: 'Foto de perfil removida com sucesso.' };
}