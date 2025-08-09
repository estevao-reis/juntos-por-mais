'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <section id="sobre" className="py-20 bg-muted/40 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-background p-8 md:p-12 rounded-2xl shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-8 text-center">
            {bio.title}
          </h2>

          <div 
            className={cn(
              "relative text-lg text-foreground/80 leading-relaxed space-y-6 text-center transition-[max-height] duration-700 ease-in-out overflow-hidden",
              !isExpanded && "max-h-80 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
            )}
            style={{ maxHeight: isExpanded ? '1200px' : '320px' }}
          >
            {bio.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
            
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="mt-8 text-primary hover:text-primary"
              >
              {isExpanded ? 'Ler Menos' : 'Continue Lendo'}
              <ChevronDown className={cn("ml-2 size-5 transition-transform duration-300", { "rotate-180": isExpanded })} />
            </Button>
          </div>
        </div>
      </div>
    </section>
); }