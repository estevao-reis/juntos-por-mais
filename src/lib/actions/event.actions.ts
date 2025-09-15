"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

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
  let event_date = formData.get('event_date') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;

  if (!name || !event_date) {
    return { success: false, message: "Nome e data do evento são obrigatórios." };
  }

  if (event_date) {
    event_date = `${event_date}:00-03:00`;
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
    location,
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

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado." };

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') return { success: false, message: "Permissão de administrador necessária." };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  let event_date = formData.get('event_date') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;

  if (!id || !name || !event_date) {
    return { success: false, message: "ID, nome e data do evento são obrigatórios." };
  }

  if (event_date) {
    event_date = `${event_date}:00-03:00`;
  }

  const { error } = await supabase
    .from('Events')
    .update({ name, event_date, description, location })
    .eq('id', id);

  if (error) {
    console.error("Erro ao atualizar evento:", error);
    return { success: false, message: `Falha ao atualizar evento: ${error.message}` };
  }

  revalidatePath('/admin/events');
  revalidatePath(`/eventos/${generateSlug(name)}`);
  return { success: true, message: "Evento atualizado com sucesso!" };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Acesso negado." };

  const { data: profile } = await supabase.from('Users').select('role').eq('auth_id', user.id).single();
  if (profile?.role !== 'ADMIN') return { success: false, message: "Permissão de administrador necessária." };

  const { error } = await supabase.from('Events').delete().eq('id', id);

  if (error) {
    console.error("Erro ao excluir evento:", error);
    return { success: false, message: `Falha ao excluir evento: ${error.message}` };
  }

  revalidatePath('/admin/events');
  return { success: true, message: "Evento excluído com sucesso." };
}