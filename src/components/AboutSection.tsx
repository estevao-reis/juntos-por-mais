'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { value: "+15", label: "Anos de Vida Pública" },
  { value: "+1.000", label: "Vidas Impactadas" },
  { value: "35", label: "Regiões do DF Alcançadas" },
];

const bio = {
  title: "Quem é Estevão Reis?",
  paragraphs: [
    "Estevão Reis nasceu em 2 de setembro de 1968, em Nova Canaã, Bahia, e vive no Distrito Federal desde 1981. É graduado em Administração de Empresas pela Faculdade Serrana de Sobradinho (DF) e atualmente cursa Direito. Desde 1989, atua como servidor da Secretaria de Educação do Distrito Federal, onde construiu uma sólida trajetória na gestão pública.",
    "Ocupou cargos estratégicos como administrador regional de Sobradinho, Sobradinho II, Fercal e Planaltina (2015–2017), sendo reconhecido como um gestor pragmático, eficiente e eficaz, especialmente no licenciamento de atividades econômicas, na execução de obras de infraestrutura urbana e no avanço da regularização fundiária, pauta na qual permanece atuante.",
    "Como Secretário Executivo de Turismo do Distrito Federal, incentivou, licenciou e estruturou novos produtos turísticos, com foco no turismo cívico, rural e cultural. Promoveu o fortalecimento do trade turístico, valorizou artesãos e estabeleceu parcerias com entidades do terceiro setor, ampliando o alcance de projetos da Secretaria de Turismo (SETUR) e contribuindo para o desenvolvimento econômico regional.",
    "Demonstrou forte atuação social, especialmente no campo da saúde mental, por meio da criação e liderança do Instituto Vida Plena, voltado ao acolhimento, recuperação e reinserção social de pessoas em situação de vulnerabilidade. Também é referência no cuidado e valorização da terceira juventude (60+), defendendo políticas públicas inclusivas, voltadas ao envelhecimento ativo, digno e participativo.",
    "Estevão Reis é uma liderança comprometida com o desenvolvimento econômeno, o fortalecimento do empreendedorismo, a promoção da saúde mental, a valorização da população idosa e a construção de políticas públicas eficazes e humanas. Sua atuação une gestão, impacto social e visão de futuro."
] };

export function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12 items-center max-w-6xl mx-auto">
          
          <div className="lg:col-span-1 flex flex-col items-center gap-8">
            <div className="relative h-48 w-48 rounded-full overflow-hidden bg-background shadow-lg">
              <Image 
                src="/estevao-reis-perfil.jpg"
                alt="Foto de Estevão Reis"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 text-center w-full">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <h3 className="text-3xl font-bold text-primary tracking-tighter">{stat.value}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6 text-center lg:text-left">
              {bio.title}
            </h2>

            <div 
              className={cn(
                "relative text-lg text-foreground/80 leading-relaxed text-center lg:text-left transition-[max-height] duration-700 ease-in-out",
                !isExpanded && "[mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
              )}
              style={{ maxHeight: isExpanded ? '1200px' : '320px' }}
            >
              <div className="space-y-6">
                {bio.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="text-center lg:text-left">
                <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="mt-6 text-primary hover:text-primary px-0"
                >
                {isExpanded ? 'Ler Menos' : 'Continue Lendo'}
                <ChevronDown className={cn("ml-2 size-5 transition-transform duration-300", { "rotate-180": isExpanded })} />
                </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
); }