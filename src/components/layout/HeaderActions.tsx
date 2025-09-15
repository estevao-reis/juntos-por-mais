'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.actions';
import { MobileSidebar } from './Mobilesidebar';
import { useState } from 'react';

const leaderLinks = [
  { href: '/painel', title: 'Meu Painel' },
  { href: '/painel/perfil', title: 'Meu Perfil' },
];

const adminLinks = [
  { href: '/admin/dashboard', title: 'Painel Geral' },
  { href: '/admin/announcements', title: 'Gerenciar Avisos' },
  { href: '/admin/events', title: 'Gerenciar Eventos' },
  { href: '/admin/usuarios', title: 'Gerenciar Usuários' },
];

interface HeaderActionsProps {
  user: User | null;
  isAdmin: boolean;
}

export function HeaderActions({ user, isAdmin }: HeaderActionsProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleLeaderLinks = isAdmin
    ? leaderLinks.filter(link => link.href !== '/painel')
    : leaderLinks;

  return (
    <>
      <nav className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <NavigationMenu>
              <NavigationMenuList>
                {visibleLeaderLinks.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Painel</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-1 p-2">
                        {visibleLeaderLinks.map(link => (
                          <li key={link.href}>
                            <NavigationMenuLink asChild>
                              <Link href={link.href} className="flex h-full w-full select-none flex-col justify-end rounded-md bg-transparent p-3 no-underline outline-none hover:bg-accent focus:shadow-md">
                                {link.title}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
                {isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Administrador</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-1 p-2">
                        {adminLinks.map(link => (
                          <li key={link.href}>
                            <NavigationMenuLink asChild>
                              <Link href={link.href} className="flex h-full w-full select-none flex-col justify-end rounded-md bg-transparent p-3 no-underline outline-none hover:bg-accent focus:shadow-md">
                                {link.title}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
            <form action={signOut}>
              <Button variant="outline" size="sm">Sair</Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/cadastro" className="font-medium text-sm hover:text-primary transition-colors">Junte-se a Nós</Link>
            <Link href="/seja-um-lider" className="font-medium text-sm hover:text-primary transition-colors">Sou Líder e Quero Atuar</Link>
            <Link href="/login">
              <Button variant="default" size="sm">Entrar</Button>
            </Link>
          </>
        )}
      </nav>

      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon"><Menu className="size-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Menu Principal</SheetTitle>
            <SheetDescription className="sr-only">Navegação principal do site.</SheetDescription>

            <MobileSidebar user={user} isAdmin={isAdmin} onClose={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
); }