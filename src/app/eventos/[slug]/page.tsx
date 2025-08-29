import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { Calendar, Clock } from "lucide-react";

export default async function EventPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("Events")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!event) {
    notFound();
  }
  
  const { data: regions } = await supabase.from('AdministrativeRegions').select('id, name').order('name');

  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-muted/40 min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-background p-8 md:p-12 rounded-2xl shadow-lg">
          
          <header className="text-center border-b pb-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{event.name}</h1>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formattedTime}</span>
                </div>
            </div>
          </header>

          {event.description && (
            <div className="prose dark:prose-invert max-w-none mb-10 text-center mx-auto">
              <p>{event.description}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-center mb-6">Confirme sua Presença</h2>
            <EventRegistrationForm eventId={event.id} regions={regions || []} />
          </div>

        </div>
      </div>
    </div>
); }