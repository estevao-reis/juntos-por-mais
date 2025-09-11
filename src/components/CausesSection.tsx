import { TrendingUp, BrainCircuit, Users, PawPrint, Home } from 'lucide-react';

const causes = [
  { 
    icon: TrendingUp, 
    title: 'Empreendedorismo que Gera Emprego e Renda', 
    description: 'Apoiamos iniciativas que impulsionam o desenvolvimento econômico local e criam oportunidades para todos.',
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30'
  },
  { 
    icon: BrainCircuit, 
    title: 'Saúde Mental como Prioridade de Governo', 
    description: 'Garantimos acesso a serviços de saúde mental de qualidade, desmistificando o tema e oferecendo suporte.',
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
  },
  { 
    icon: Users, 
    title: 'Respeito e Cuidado com os 60+', 
    description: 'Promovemos políticas que asseguram dignidade, bem-estar e participação ativa para a nossa população idosa.',
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
  },
  { 
    icon: PawPrint, 
    title: 'Proteção aos Animais de Estimação', 
    description: 'Lutamos por leis e ações que garantam o bem-estar, a proteção e o respeito a todos os animais.',
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
  },
  { 
    icon: Home, 
    title: 'Moradia com Segurança Jurídica', 
    description: 'Trabalhamos pela regularização fundiária e por moradias dignas para milhares de famílias do DF.',
    color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30'
}, ];

export function CausesSection() {
  return (
    <section id="causas" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Nossas Causas: Construindo um Futuro Melhor Juntos
          </h2>
          <p className="text-lg text-muted-foreground">
            Conheça as bandeiras que defendemos para transformar vidas e nossa comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause, index) => {
            const Icon = cause.icon;
            return (
              <div 
                key={index} 
                className="bg-card p-8 rounded-xl shadow-sm border flex flex-col items-center text-center transition-transform hover:-translate-y-2 duration-300"
              >
                <div className={`mb-6 p-4 rounded-full ${cause.color}`}>
                  <Icon className="size-16" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {cause.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm flex-grow">
                  {cause.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
); }