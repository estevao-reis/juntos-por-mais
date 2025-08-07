import { RegistrationForm } from "@/app/components/RegistrationForm";

interface BaseData {
  id: string;
  name: string;
}

interface CTASectionProps {
  leaders: BaseData[];
  regions: BaseData[];
}

export function CTASection({ leaders, regions }: CTASectionProps) {
  return (
    <section id="cadastro" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Faça Parte da Mudança no DF</h2>
          <p className="mt-4 text-muted-foreground">
            Sua participação é fundamental para construirmos um futuro melhor. Preencha o formulário e junte-se à nossa rede de apoiadores.
          </p>
        </div>
        <RegistrationForm leaders={leaders} regions={regions} />
      </div>
    </section>
); }