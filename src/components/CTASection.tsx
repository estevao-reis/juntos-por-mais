import { RegistrationForm } from "@/app/components/RegistrationForm";

interface BaseData {
  id: string;
  name: string;
}

interface CTASectionProps {
  leaders: BaseData[];
  regions: BaseData[];
  leaderRefId?: string;
}

export function CTASection({ leaders, regions, leaderRefId }: CTASectionProps) {
  return (
    <section id="cadastro" className="py-20 bg-background scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Participe da Mudança no Distrito Federal</h2>
          <p className="mt-4 text-muted-foreground">
            Sua participação é fundamental. Junte-se a nós como <strong>apoiador</strong>.
          </p>
        </div>

        <RegistrationForm leaders={leaders} regions={regions} defaultLeaderId={leaderRefId} />
      </div>
    </section>
); }