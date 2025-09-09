'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, ListChecks, LayoutList, LayoutDashboard, Text, LogIn, LogOut, UserPlus, UserCircle, CalendarPlus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/app/actions';
import Image from 'next/image';

interface MobileSidebarProps {
  user: User | null;
  isAdmin: boolean;
  onClose: () => void;
}

const publicLinks = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/cadastro', label: 'Quero Apoiar', icon: ListChecks },
];

const guestLinks = [
    { href: '/seja-um-lider', label: 'Sou Líder e Quero Atuar', icon: UserPlus },
]

const leaderLinks = [
  { href: '/painel', title: 'Meu Painel', icon: LayoutList },
  { href: '/painel/perfil', title: 'Meu Perfil', icon: UserCircle },
];

const adminLinks = [
  { href: '/admin/dashboard', title: 'Painel Geral', icon: LayoutDashboard },
  { href: '/admin/announcements', title: 'Gerenciar Avisos', icon: Text },
  { href: '/admin/events', title: 'Gerenciar Eventos', icon: CalendarPlus },
  { href: '/admin/usuarios', title: 'Gerenciar Usuários', icon: UserPlus },
];

export function MobileSidebar({ user, isAdmin, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  const visibleLeaderLinks = isAdmin
    ? leaderLinks.filter(link => link.href !== '/painel')
    : leaderLinks;

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link href={href} onClick={onClose} className={cn(
      "flex items-center gap-4 p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
      pathname === href && "bg-accent text-accent-foreground"
    )}>
      <Icon className="size-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/" onClick={onClose} className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <Image
            src="/estevao-reis-perfil2-rounded.png"
            alt="Juntos por Mais Logo"
            width={32}
            height={32}
          />
          Menu
        </Link>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-6">
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground/80">Principal</h3>
          <div className="flex flex-col gap-1">
            {publicLinks.map(link => <NavLink key={link.href} {...link} />)}
            {!user && guestLinks.map(link => <NavLink key={link.href} {...link} />)}
          </div>
        </div>

        {user && (
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground/80">Painel</h3>
            <div className="flex flex-col gap-1">
              {visibleLeaderLinks.map(link => <NavLink key={link.href} href={link.href} label={link.title} icon={link.icon} />)}
            </div>
          </div>
        )}

        {isAdmin && (
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground/80">Administrador</h3>
            <div className="flex flex-col gap-1">
              {adminLinks.map(link => <NavLink key={link.href} href={link.href} label={link.title} icon={link.icon} />)}
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto p-4 border-t">
        {user ? (
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start gap-4 p-3 h-auto">
              <LogOut className="size-5" />
              <span className="font-medium">Sair</span>
            </Button>
          </form>
        ) : (
          <Link href="/login" onClick={onClose}>
            <Button variant="default" className="w-full justify-center gap-2">
              <LogIn className="size-5" />
              Entrar
            </Button>
          </Link>
        )}
      </div>
    </div>
); }