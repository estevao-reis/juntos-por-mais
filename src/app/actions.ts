'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
    return { success: false, message: 'Falha ao cadastrar.' }
  }

  console.log('Parceiro cadastrado com sucesso!')
  revalidatePath('/')
  return { success: true, message: 'Cadastro realizado com sucesso!' }
}