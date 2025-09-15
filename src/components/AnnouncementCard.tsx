'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { deleteAnnouncement, updateAnnouncement } from '@/lib/actions/announcement.actions';
import { Pencil, Trash2 } from 'lucide-react';

type Announcement = {
  id: string;
  created_at: string;
  content: string;
};

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(announcement.content);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este aviso?')) {
      const result = await deleteAnnouncement(announcement.id);
      alert(result.message);
  } };

  const handleUpdate = async (formData: FormData) => {
    const result = await updateAnnouncement(formData);
    alert(result.message);
    if (result.success) {
      setIsEditing(false);
  } };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Enviado em {new Date(announcement.created_at).toLocaleString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form action={handleUpdate} className="grid gap-4">
            <input type="hidden" name="id" value={announcement.id} />
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="whitespace-pre-wrap"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        ) : (
          <p className="whitespace-pre-wrap">{announcement.content}</p>
        )}
      </CardContent>
      {!isEditing && (
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="size-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
); }