import { Instagram, Facebook } from 'lucide-react';

const socials = [
  { name: "Instagram", url: "https://instagram.com/estevao_reis", icon: <Instagram className="h-5 w-5" /> },
  { name: "Facebook", url: "https://facebook.com/estevaoreisdf", icon: <Facebook className="h-5 w-5" /> },
];

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Estevão Reis. Todos os direitos reservados.
        </p>
        <div className="flex space-x-4">
          {socials.map((social) => (
            <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">{social.name}</span>
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
); }