"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
    return { success: false, message: "Por favor, preencha todos os campos essenciais." };
  }
  if (password.length < 6) {
    return { success: false, message: "A senha deve ter no mínimo 6 caracteres." };
  }
  const cleanedCpf = cpf.replace(/[^\d]+/g, "");
  if (!validateCPF(cleanedCpf)) {
    return { success: false, message: "CPF inválido." };
  }

  const supabase = await createClient();
  const { data: existingSupporter } = await supabase
    .from("Users")
    .select("id, auth_id, role")
    .eq("email", email)
    .single();

  if (existingSupporter) {
    if (existingSupporter.role === "SUPPORTER" && !existingSupporter.auth_id) {
      const cookieStore = await cookies();
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) { return cookieStore.get(name)?.value },
            set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
            remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      }, } );

      const { data: { user }, error: creationError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (creationError) {
        console.error("Erro na criação do usuário admin durante o upgrade:", creationError);
        return { success: false, message: `Falha ao criar autenticação: ${creationError.message}` };
      }
      if (!user) {
        return { success: false, message: "Não foi possível criar o usuário de autenticação." };
      }

      const { error: updateError } = await supabaseAdmin
        .from("Users")
        .update({
          role: "LEADER", name, cpf: cleanedCpf, phone_number,
          region_id, birth_date: formatDateForDB(birthDate), occupation, motivation,
        })
        .eq("id", existingSupporter.id);

      if (updateError) {
        console.error("Erro ao atualizar Apoiador para Líder:", updateError);
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        return { success: false, message: `Falha ao atualizar perfil para líder: ${updateError.message}` };
      }

      revalidatePath("/seja-um-lider");
      return { success: true, message: "Seu perfil de apoiador foi atualizado para Líder com sucesso! Você já pode fazer login." };
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
        name, cpf: cleanedCpf, phone_number, region_id,
        birth_date: formatDateForDB(birthDate), occupation, motivation,
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
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    return { success: false, message: "Credenciais inválidas." };
  }

  if (signInData.user) {
    const { data: profile } = await supabase
      .from('Users')
      .select('role')
      .eq('auth_id', signInData.user.id)
      .single();

    revalidatePath("/", "layout");

    if (profile?.role === 'ADMIN') {
      redirect('/admin/dashboard');
  } }

  redirect('/painel');
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
    .select('id, name, email, created_at, region:AdministrativeRegions(name)')
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



function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado: Usuário não autenticado." };

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') return { success: false, message: "Acesso negado: Permissão de administrador necessária." };

  const name = formData.get('name') as string;
  const event_date = formData.get('event_date') as string;
  const description = formData.get('description') as string;

  if (!name || !event_date) {
    return { success: false, message: "Nome e data do evento são obrigatórios." };
  }

  const slug = generateSlug(name);

  const { data: existingEvent } = await supabase.from('Events').select('id').eq('slug', slug).single();
  if (existingEvent) {
    return { success: false, message: "Já existe um evento com um nome muito parecido. Por favor, escolha um nome ligeiramente diferente." };
  }

  const { error } = await supabase.from('Events').insert({
    name,
    slug,
    event_date,
    description,
  });

  if (error) {
    console.error("Erro ao criar evento:", error);
    return { success: false, message: `Falha ao criar evento: ${error.message}` };
  }

  revalidatePath('/admin/events');
  return { success: true, message: "Evento criado com sucesso!" };
}

export async function registerForEvent(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const event_id = formData.get("event_id") as string;
  const leader_id = (formData.get("leader_id") as string) || null;

  if (!email || !event_id) {
    return { success: false, message: "E-mail e identificação do evento são obrigatórios." };
  }

  let { data: existingUser } = await supabase.from("Users").select("id").eq("email", email).single();

  if (!existingUser) {
    const name = formData.get("name") as string;
    const phone_number = formData.get("phone_number") as string;
    const region_id = formData.get("region_id") as string;

    if (!name || !phone_number || !region_id) {
      return { success: false, message: "Para novos apoiadores, nome, telefone e região são obrigatórios." };
    }

    const { data: newUser, error: createUserError } = await supabase
      .from("Users")
      .insert({
        name,
        email,
        phone_number,
        region_id,
        role: "SUPPORTER",
        leader_id: leader_id,
      })
      .select("id")
      .single();

    if (createUserError) {
      console.error("Erro ao criar novo usuário durante inscrição no evento:", createUserError);
      return { success: false, message: `Falha ao cadastrar: ${createUserError.message}` };
    }
    existingUser = newUser;
  }
  
  if (!existingUser) {
     return { success: false, message: "Ocorreu um erro inesperado ao processar seu cadastro." };
  }

  const { error: registrationError } = await supabase.from("EventRegistrations").insert({
    event_id,
    user_id: existingUser.id,
    leader_id: leader_id,
  });

  if (registrationError) {
    if (registrationError.code === '23505') {
       return { success: true, message: "Confirmamos que você já estava inscrito neste evento. Sua presença está garantida!" };
    }
    console.error("Erro ao registrar presença:", registrationError);
    return { success: false, message: `Falha ao confirmar presença: ${registrationError.message}` };
  }

  revalidatePath(`/eventos/`);
  return { success: true, message: "Presença confirmada com sucesso! Obrigado por participar." };
}