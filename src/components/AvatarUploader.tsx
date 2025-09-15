"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserCircle, UploadCloud, Trash2, Loader2 } from "lucide-react";
import { updateAvatarUrl, removeAvatar } from "@/lib/actions/user.actions";

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null;
}

export function AvatarUploader({
  userId,
  currentAvatarUrl,
}: AvatarUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
  } };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("avatar") as File;

    if (!file || file.size === 0) {
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    try {
      setUploading(true);

      const filePath = `${userId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const result = await updateAvatarUrl(publicUrl);
      if (result.success) {
        alert("Foto de perfil atualizada com sucesso!");
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error: unknown) {
      let errorMessage = 'Ocorreu um erro desconhecido.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Erro no upload: ${errorMessage}`);
    } finally {
      setUploading(false);
  } };

  const handleRemove = async () => {
    if (!confirm("Tem certeza que deseja remover sua foto de perfil?")) {
      return;
    }
    setUploading(true);
    const result = await removeAvatar();
    if (result.success) {
      setPreviewUrl(null);
      alert(result.message);
    } else {
      alert(`Erro: ${result.message}`);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32 rounded-full overflow-hidden border">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Avatar do usuário"
            fill={true}
            className="object-cover"
          />
        ) : (
          <UserCircle className="h-full w-full text-muted-foreground" />
        )}
      </div>

      <form onSubmit={handleUpload} className="flex items-center gap-2">
        <Label
          htmlFor="avatar"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {previewUrl === currentAvatarUrl ? "Trocar Foto" : "Escolher Outra"}
        </Label>
        <Input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl && previewUrl !== currentAvatarUrl && (
          <Button type="submit" disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {uploading ? "Enviando..." : "Salvar"}
          </Button>
        )}
      </form>

      {previewUrl && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Remover Foto
        </Button>
      )}
    </div>
); }