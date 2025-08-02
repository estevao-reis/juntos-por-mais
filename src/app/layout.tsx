import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { createClient } from '@/lib/supabase/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Juntos com Estêvão Reis",
  description: "Plataforma de parceiros.",
  icons: {
    icon: '/logo.png',
}, };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header user={user} isAdmin={isAdmin} />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
); }