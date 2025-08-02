import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { HeaderActions } from './HeaderActions';

interface HeaderProps {
  user: User | null;
  isAdmin: boolean;
}

export function Header({ user, isAdmin }: HeaderProps) {
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

        <HeaderActions user={user} isAdmin={isAdmin} />
      </div>
    </header>
); }