'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Calendar, UserCheck, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


type EventDetails = {
  id: string;
  name: string;
  event_date: string;
  slug: string;
};

type Registrant = {
  supporter_name: string;
  supporter_region: string;
  leader_name: string;
};

export default function AdminEventDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const supabase = createClient();

    async function fetchData() {
      setLoading(true);
      setError(null);

      const { data: eventData, error: eventError } = await supabase
        .from('Events')
        .select('id, name, event_date, slug')
        .eq('slug', slug)
        .single();

      if (eventError || !eventData) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }
      setEvent(eventData);

      const { data: registrantsData, error: registrantsError } = await supabase.rpc(
        'get_event_registrants_with_details',
        { p_event_slug: slug }
      );

      if (registrantsError) {
        setError("Erro ao buscar inscritos.");
        console.error("Erro RPC:", registrantsError);
      } else {
        setRegistrants(registrantsData || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  const handleExportPDF = () => {
    if (!event) return;

    const doc = new jsPDF();
    const tableColumn = ["Nome do Apoiador", "Região", "Indicado Por"];
    const tableRows: (string | null)[][] = [];

    registrants.forEach(reg => {
      const registrantData = [
        reg.supporter_name,
        reg.supporter_region || 'N/A',
        reg.leader_name || 'Inscrição Direta'
      ];
      tableRows.push(registrantData);
    });

    doc.text(`Lista de Inscritos - ${event.name}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Data do Evento: ${new Date(event.event_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 20);
    doc.text(`Total de Inscritos: ${registrants.length}`, 14, 25);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
    });

    doc.save(`inscritos_${event.slug}.pdf`);
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Carregando detalhes do evento...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-destructive">{error}</div>;
  }

  if (!event) {
    return <div className="container mx-auto p-8 text-center">Evento não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(event.event_date).toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo'
              })}
            </p>
        </div>
        <Button onClick={handleExportPDF} disabled={registrants.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar para PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Lista de Inscritos
          </CardTitle>
          <CardDescription>
            Total de {registrants.length} participantes confirmados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Apoiador</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Indicado Por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrants.length > 0 ? (
                  registrants.map((reg, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{reg.supporter_name}</TableCell>
                      <TableCell>{reg.supporter_region || 'N/A'}</TableCell>
                      <TableCell>{reg.leader_name || 'Inscrição Direta'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhum inscrito até o momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
); }