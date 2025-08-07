import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  let profilePictureUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('Users')
      .select('role, profile_picture_url')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      isAdmin = profile.role === 'ADMIN';
      profilePictureUrl = profile.profile_picture_url;
  } }

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Header user={user} isAdmin={isAdmin} profilePictureUrl={profilePictureUrl} />
        <main className="pt-16 flex-grow">
          {children}
        </main>
        <Footer /> 
      </body>
    </html>
)};