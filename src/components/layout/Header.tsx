import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { signOut } from '@/app/actions';

import { LoaderCircle } from 'lucide-react';


const leaderLinks = [
  { href: '/painel', title: 'Painel de Avisos' },
];

const adminLinks = [
  { href: '/admin/dashboard', title: 'Relatório Geral' },
  { href: '/admin/announcements', title: 'Gerenciar Avisos' },
];

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('Users')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'ADMIN';
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 flex items-center bg-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex gap-3 items-center text-lg font-semibold text-foreground">
          <LoaderCircle />

          Conectar
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="font-medium text-sm hover:text-primary transition-colors">Início</Link>
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
        </div>

        <div className="md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="font-bold">Início</Link>
                {user ? (
                  <>
                    <p className="font-bold pt-4 border-t">Painel</p>
                    {leaderLinks.map(link => <Link key={link.href} href={link.href}>{link.title}</Link>)}
                    
                    {isAdmin && (
                      <>
                        <p className="font-bold pt-4 border-t">Admin</p>
                        {adminLinks.map(link => <Link key={link.href} href={link.href}>{link.title}</Link>)}
                      </>
                    )}
                    <form action={signOut} className="pt-4 border-t">
                      <Button variant="outline" className="w-full">Sair</Button>
                    </form>
                  </>
                ) : (
                  <Link href="/login">
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
); }