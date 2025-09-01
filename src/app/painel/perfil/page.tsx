import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { ReferralLink } from "@/components/ReferralLink";
import { AvatarUploader } from "@/components/AvatarUploader";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const [profileRes, regionsRes] = await Promise.all([
    supabase.from('Users').select('*').eq('auth_id', user.id).single(),
    supabase.from('AdministrativeRegions').select('id, name').order('name')
  ]);

  const profileData = profileRes.data;
  const regions = regionsRes.data || [];

  if (profileRes.error || !profileData) {
    console.error("Erro ao buscar perfil:", profileRes.error);
    return redirect('/painel'); 
  }

  return (
    <div className="container mx-auto p-8">
        <header className="mb-10">
            <h1 className="text-3xl font-bold">Meu Perfil e Ferramentas</h1>
            <p className="mt-2 text-muted-foreground">
                Mantenha suas informações atualizadas e utilize suas ferramentas de líder.
            </p>
        </header>

        <main className="max-w-lg mx-auto grid gap-12">
            <AvatarUploader 
              userId={profileData.id} 
              currentAvatarUrl={profileData.profile_picture_url} 
            />
            
            {profileData.role === 'LEADER' && (
              <ReferralLink userId={profileData.id} />
            )}

            <div className="grid gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Editar Informações</h2>
              <ProfileForm user={profileData} regions={regions} />
            </div>
        </main>
    </div>
); }