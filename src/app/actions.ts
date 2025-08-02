'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerPartner(formData: FormData) {
  const supabase = await createClient();

  const partnerData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    leader_id: formData.get('leader') as string,
    role: 'PARTNER' as const,
  }

  const { error } = await supabase.from('Users').insert(partnerData)

  if (error) {
    console.error('Erro ao cadastrar parceiro:', error)
    return { success: false, message: `Falha ao cadastrar: ${error.message}` }
  }

  console.log('Parceiro cadastrado com sucesso!')
  revalidatePath('/')
  return { success: true, message: 'Cadastro realizado com sucesso!' }
}

export async function signIn(previousState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Erro no login:', error.message)
    return { success: false, message: 'Credenciais inválidas.' }
  }

  return redirect('/painel')
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Erro ao fazer logout:', error.message);
    return redirect('/painel');
  }

  return redirect('/');
}

export async function sendAnnouncement(formData: FormData) {
  const content = formData.get('content') as string;
  if (!content) {
    return { success: false, message: 'O conteúdo do aviso não pode estar vazio.' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Usuário não autenticado.' };
  }
  
  const announcementData = {
    content,
    author_id: user.id,
    target_audience: 'ALL_LEADERS',
  };

  const { error } = await supabase.from('Announcements').insert(announcementData);

  if (error) {
    console.error('Erro ao enviar aviso:', error);
    return { success: false, message: `Falha ao enviar aviso: ${error.message}` };
  }

  revalidatePath('/admin/announcements');
  revalidatePath('/painel');
  return { success: true, message: 'Aviso enviado com sucesso!' };
}