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

function formatDateForDB(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}


export async function registerPartner(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const birthDate = formData.get('birth_date') as string;

  const partnerData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone_number: formData.get("phone_number") as string,
    region_id: formData.get("region_id") as string,
    leader_id: (formData.get("leader") as string) || null,
    birth_date: formatDateForDB(birthDate),
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
  const cpf = formData.get("cpf") as string;
  const phone_number = formData.get("phone_number") as string;
  const region_id = formData.get("region_id") as string;
  const birthDate = formData.get('birth_date') as string;
  const occupation = (formData.get("occupation") as string) || null;
  const motivation = (formData.get("motivation") as string) || null;

  if (!name || !email || !password || !cpf || !phone_number || !region_id) {
    return {
      success: false,
      message: "Por favor, preencha todos os campos essenciais.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "A senha deve ter no mínimo 6 caracteres.",
    };
  }

  const cleanedCpf = cpf.replace(/[^\d]+/g, "");
  if (!validateCPF(cleanedCpf)) {
    return { success: false, message: "CPF inválido." };
  }

  // Verifica se já existe um Apoiador com este e-mail
  const { data: existingSupporter } = await supabase
    .from("Users")
    .select("id, auth_id, role")
    .eq("email", email)
    .single();

  if (existingSupporter) {
    if (existingSupporter.role === "SUPPORTER" && !existingSupporter.auth_id) {
      // --- FLUXO DE UPGRADE DE APOIADOR PARA LÍDER ---
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        console.error("Erro no SignUp durante o upgrade:", signUpError);
        return { success: false, message: `Falha ao criar autenticação: ${signUpError.message}` };
      }
      if (!user) {
        return { success: false, message: "Não foi possível criar o usuário de autenticação." };
      }

      const { error: updateError } = await supabase
        .from("Users")
        .update({
          auth_id: user.id,
          role: "LEADER",
          name,
          cpf: cleanedCpf,
          phone_number,
          region_id,
          birth_date: formatDateForDB(birthDate),
          occupation,
          motivation,
        })
        .eq("id", existingSupporter.id);

      if (updateError) {
        console.error("Erro ao atualizar Apoiador para Líder:", updateError);

        await supabase.auth.admin.deleteUser(user.id);
        return { success: false, message: `Falha ao atualizar perfil para líder: ${updateError.message}` };
      }

      revalidatePath("/seja-um-lider");
      return { success: true, message: "Seu perfil de apoiador foi atualizado para Líder! Verifique seu e-mail para confirmação." };
    } else {
      return { success: false, message: "Este e-mail já está cadastrado como um líder ou administrador." };
  } }

  const { data: existingCpfUser } = await supabase
    .from("Users")
    .select("id")
    .eq("cpf", cleanedCpf)
    .single();

  if (existingCpfUser) {
    return { success: false, message: "Este CPF já está cadastrado." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        cpf: cleanedCpf,
        phone_number,
        region_id,
        birth_date: formatDateForDB(birthDate),
        occupation,
        motivation,
  }, }, });

  if (error) {
    console.error("Erro no SignUp:", error);
    return { success: false, message: `Falha ao cadastrar: ${error.message}` };
  }

  if (data.user?.identities?.length === 0) {
    return { success: false, message: "Este e-mail já está em uso por outro método de login." };
  }

  revalidatePath("/seja-um-lider");
  return {
    success: true,
    message: "Cadastro realizado com sucesso! Verifique seu e-mail para confirmação.",
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
  }; }
  
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
  }; }
  
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

  const birthDate = formData.get('birth_date') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "Usuário não autenticado. Acesso negado.",
  }; }

  const profileId = formData.get("id") as string;

  const { data: userProfile, error: userError } = await supabase
    .from("Users")
    .select("auth_id")
    .eq("id", profileId)
    .single();

  if (userError || !userProfile || userProfile.auth_id !== user.id) {
    return {
      success: false,
      message: "Você não tem permissão para editar este perfil.",
  }; }

  const profileData = {
    name: formData.get("name") as string,
    phone_number: formData.get("phone_number") as string,
    region_id: formData.get("region_id") as string,
    
    birth_date: formatDateForDB(birthDate),
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
            auth_id,
            name,
            email,
            role,
            created_at,
            cpf,
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
    // @ts-expect-error - Supabase infere 'region' como array, mas usamos !inner para garantir que seja um objeto
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
    // @ts-expect-error - Supabase infere 'region' como array, mas usamos !inner para garantir que seja um objeto
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

export async function deleteUserByAdmin(userId: string, authId: string | null): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { success: false, message: "Acesso negado: você não está autenticado." };
  
  const { data: adminProfile } = await supabase.from('Users').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'ADMIN') return { success: false, message: "Acesso negado: permissão de administrador necessária." };
  
  if (adminUser.id === authId) {
      return { success: false, message: "Um administrador não pode excluir a própria conta." };
  }

  if (authId) {
      const { error: authError } = await supabase.auth.admin.deleteUser(authId);
      if (authError && authError.message !== 'User not found') {
          console.error("Erro ao deletar usuário da autenticação:", authError);
          return { success: false, message: `Falha ao remover autenticação do usuário: ${authError.message}` };
  } }

  const { error: dbError } = await supabase.from('Users').delete().eq('id', userId);
  if (dbError) {
      console.error("Erro ao deletar perfil do usuário:", dbError);
      return { success: false, message: `Falha ao remover perfil do usuário: ${dbError.message}` };
  }

  revalidatePath("/admin/usuarios");
  return { success: true, message: "Usuário excluído com sucesso." };
}


export async function updateUserCoreInfoByAdmin(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) return { success: false, message: "Acesso negado." };
    const { data: adminProfile } = await supabase.from('Users').select('role').eq('id', adminUser.id).single();
    if (adminProfile?.role !== 'ADMIN') return { success: false, message: "Permissão de administrador necessária." };

    const userId = formData.get('userId') as string;
    const authId = formData.get('authId') as string;
    const email = formData.get('email') as string;
    const cpf = formData.get('cpf') as string;

    if (!userId || !email || !cpf) {
        return { success: false, message: "Todos os campos são obrigatórios." };
    }
    
    const cleanedCpf = cpf.replace(/[^\d]+/g, "");
    if (!validateCPF(cleanedCpf)) {
        return { success: false, message: "CPF inválido." };
    }
    
    const { data: existingEmailUser } = await supabase.from('Users').select('id').eq('email', email).not('id', 'eq', userId).single();
    if (existingEmailUser) {
        return { success: false, message: "O e-mail informado já está em uso por outro usuário." };
    }

    const { data: existingCpfUser } = await supabase.from('Users').select('id').eq('cpf', cleanedCpf).not('id', 'eq', userId).single();
    if (existingCpfUser) {
        return { success: false, message: "O CPF informado já está em uso por outro usuário." };
    }
    
    if (authId && authId !== "null") {
      const { error: authError } = await supabase.auth.admin.updateUserById(authId, { email });
      if (authError) {
          console.error('Erro ao atualizar e-mail na autenticação:', authError);
          return { success: false, message: `Falha ao atualizar e-mail de login: ${authError.message}` };
    } }

    const { error: dbError } = await supabase.from('Users').update({ email, cpf: cleanedCpf }).eq('id', userId);
    if (dbError) {
        console.error('Erro ao atualizar perfil do usuário:', dbError);
        return { success: false, message: `Falha ao atualizar dados do perfil: ${dbError.message}` };
    }

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Dados do usuário atualizados com sucesso." };
}