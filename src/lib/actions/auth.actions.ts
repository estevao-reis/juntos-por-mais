"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function requestPasswordReset(
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/atualizar-senha`,
  });

  if (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    return { success: false, message: "Não foi possível enviar o e-mail de recuperação. Verifique o e-mail digitado." };
  }

  return { 
    success: true, 
    message: "Se uma conta com este e-mail existir, um link de recuperação foi enviado." 
}; }

export async function updatePassword(
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
        return { success: false, message: "As senhas não coincidem." };
    }
    if (password.length < 6) {
        return { success: false, message: "A senha deve ter no mínimo 6 caracteres." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error("Erro ao atualizar senha:", error);
        return { success: false, message: `Falha ao atualizar a senha: ${error.message}` };
    }

    return { success: true, message: "Sua senha foi atualizada com sucesso! Você já pode fazer o login." };
}