'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, CircleCheckBig } from 'lucide-react';
import { signOut } from '@/app/actions';
import { MobileSidebar } from './Mobilesidebar';
import Image from 'next/image';

const leaderLinks = [
  { href: '/painel', title: 'Painel de Avisos' },
];

const adminLinks = [
  { href: '/admin/dashboard', title: 'Relatório Geral' },
  { href: '/admin/announcements', title: 'Gerenciar Avisos' },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('Users')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'ADMIN');
      } else {
        setIsAdmin(false);
    } };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        checkUser();
    });

    return () => {
        authListener.subscription.unsubscribe();
  }; }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 flex items-center bg-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-foreground">
        <Image 
            src="/logo.png"
            alt="Juntos por Mais Logo"
            width={32}
            height={32}
          />
          Início
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/cadastro" className="font-medium text-sm hover:text-primary transition-colors">Cadastro</Link>

          {user ? (
            <>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Painel</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-1 p-2">
                        {leaderLinks.map(link => (
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
            <Link href="/login">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}
        </nav>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">

              <SheetTitle className="sr-only">Menu Principal</SheetTitle>
              <MobileSidebar user={user} isAdmin={isAdmin} onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
); }