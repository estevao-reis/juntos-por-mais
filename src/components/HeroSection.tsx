"use client";

import { Instagram, Facebook, ArrowDownCircle } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";

const socials = [
  {
    name: "Instagram",
    url: "https://instagram.com/estevao_reis",
    icon: <Instagram className="h-6 w-6" />,
  },
  {
    name: "Facebook",
    url: "https://facebook.com/estevaoreisdf",
    icon: <Facebook className="h-6 w-6" />,
}, ];

export function HeroSection() {
  return (
    <div className="relative bg-slate-200 overflow-hidden">
      <div className="absolute inset-0 bg-sprinkle-pattern" />
      <div className="absolute inset-0 bg-gradient-radial from-slate-100/90 to-slate-200/10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-28 md:py-36 flex flex-col items-center">
        <TextGenerateEffect
          words="Juntos com Estêvão Reis: Unindo Forças por um Distrito Federal Mais Próspero e Justo."
          className="text-black text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight"
        />

        <p className="mt-8 text-xl text-slate-700 max-w-3xl mx-auto">
          Cada novo apoiador fortalece nossa rede e amplifica nossa voz. Ao se
          cadastrar, você se torna parte ativa de um movimento dedicado a trazer
          mais oportunidades, segurança e qualidade de vida para todas as
          regiões do Distrito Federal. Sua participação é o primeiro passo para
          a mudança que queremos ver.
        </p>

        <div className="mt-8 flex justify-center space-x-6">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-black transition-colors duration-300"
            >
              <span className="sr-only">{social.name}</span>
              {social.icon}
            </a>
          ))}
        </div>
        <a
          href="#cadastro"
          className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <Button
            size="lg"
            className="bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg transition-transform hover:scale-105"
          >
            Quero Apoiar
            <ArrowDownCircle className="ml-2 h-5 w-5" />
          </Button>
        </a>
      </div>
    </div>
); }