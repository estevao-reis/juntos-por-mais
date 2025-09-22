"use server";

import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from "@/lib/supabase/server";

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

export async function updateUserProfile(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { success: false, message: "Usuário não autenticado. Acesso negado." };
  }

  const profileIdToEdit = formData.get("id") as string;

  const { data: profileToEdit, error: findError } = await supabase
    .from('Users')
    .select('auth_id, email, cpf')
    .eq('id', profileIdToEdit)
    .single();

  if (findError || !profileToEdit) {
      return { success: false, message: "Perfil a ser editado não encontrado." };
  }

  const { data: currentUserProfile } = await supabase
    .from('Users')
    .select('role')
    .eq('auth_id', currentUser.id)
    .single();

  if (!currentUserProfile) {
      return { success: false, message: "Perfil do usuário atual não encontrado." };
  }

  const isOwner = profileToEdit.auth_id === currentUser.id;
  const isAdmin = currentUserProfile.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
      return { success: false, message: "Você não tem permissão para editar este perfil." };
  }

  const profileData: { [key: string]: string | null } = {
    name: formData.get("name") as string,
    phone_number: formData.get("phone_number") as string,
    region_id: formData.get("region_id") as string,
    birth_date: formatDateForDB(formData.get('birth_date') as string),
    occupation: (formData.get("occupation") as string) || null,
    motivation: (formData.get("motivation") as string) || null,
  };

  if (isAdmin) {
    const newEmail = formData.get('email') as string;
    const newCpf = formData.get('cpf') as string;

    if (newEmail && newEmail !== profileToEdit.email) {
      const { data: existingEmail } = await supabase.from('Users').select('id').eq('email', newEmail).not('id', 'eq', profileIdToEdit).single();
      if (existingEmail) {
        return { success: false, message: "O e-mail informado já está em uso." };
      }
      if (profileToEdit.auth_id) {
        const { error: authError } = await supabase.auth.admin.updateUserById(profileToEdit.auth_id, { email: newEmail });
        if (authError) {
          return { success: false, message: `Falha ao atualizar e-mail de login: ${authError.message}` };
      } }
      profileData.email = newEmail;
    }

    if (newCpf && newCpf !== profileToEdit.cpf) {
      const cleanedCpf = newCpf.replace(/[^\d]+/g, "");
      if (!validateCPF(cleanedCpf)) {
        return { success: false, message: "CPF inválido." };
      }
      const { data: existingCpf } = await supabase.from('Users').select('id').eq('cpf', cleanedCpf).not('id', 'eq', profileIdToEdit).single();
      if (existingCpf) {
        return { success: false, message: "O CPF informado já está em uso." };
      }
      profileData.cpf = cleanedCpf;
  } }

  const { error } = await supabase
    .from("Users")
    .update(profileData)
    .eq("id", profileIdToEdit);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, message: `Falha ao salvar alterações: ${error.message}` };
  }

  revalidatePath("/painel/perfil");
  revalidatePath("/admin/usuarios");
  revalidatePath("/", "layout");

  return { success: true, message: "Perfil atualizado com sucesso!" };
}

export async function getUsersWithRoles() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("Users")
    .select("role")
    .eq("auth_id", user.id)
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
            phone_number,
            birth_date,
            occupation,
            motivation,
            region:AdministrativeRegions(name)
        `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }

  return data.map((u) => ({
    ...u,
    // @ts-expect-error - Supabase infere 'region' como objeto ou array, garantimos que é objeto.
    region_name: u.region?.name ?? null,
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
    .eq("auth_id", adminUser.id)
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
    .eq('auth_id', user.id);

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

  const { data: profile } = await supabase
    .from('Users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
      return [];
  }

  const { data, error } = await supabase
    .from('Users')
    .select(`
      id,
      name,
      email,
      created_at,
      phone_number,
      birth_date,
      occupation,
      motivation,
      role,
      cpf,
      region:AdministrativeRegions(name)
    `)
    .eq('leader_id', profile.id)
    .eq('role', 'SUPPORTER')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar apoiadores indicados:', error);
    return [];
  }

  return data.map(u => ({
    ...u,
    // @ts-expect-error - Supabase infere 'region' como objeto ou array, garantimos que é objeto.
    region_name: u.region?.name ?? 'N/A'
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
    .eq('auth_id', user.id)
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
    if (storageError.message !== 'The resource was not found') {
        return { success: false, message: 'Não foi possível remover o arquivo da foto.' };
  } }

  const { error: updateError } = await supabase
    .from('Users')
    .update({ profile_picture_url: null })
    .eq('auth_id', user.id);

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

  const { data: adminProfile } = await supabase.from('Users').select('role').eq('auth_id', adminUser.id).single();
  if (adminProfile?.role !== 'ADMIN') return { success: false, message: "Acesso negado: permissão de administrador necessária." };

  if (adminUser.id === authId) {
      return { success: false, message: "Um administrador não pode excluir a própria conta." };
  }

  const cookieStore = await cookies();

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorado em Server Actions
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignorado em Server Actions
  } }, }, } );

  await supabaseAdmin.from('Users').update({ leader_id: null }).eq('leader_id', userId);
  await supabaseAdmin.from('EventRegistrations').update({ leader_id: null }).eq('leader_id', userId);

  if (authId) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authId);
      if (authError && authError.message !== 'User not found') {
          console.error("Erro ao deletar usuário da autenticação:", authError);
          return { success: false, message: `Falha ao remover autenticação do usuário: ${authError.message}` };
  } }

  const { error: dbError } = await supabaseAdmin.from('Users').delete().eq('id', userId);
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
    const { data: adminProfile } = await supabase.from('Users').select('role').eq('auth_id', adminUser.id).single();
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