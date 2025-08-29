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

const siteUrl = 'https://juntos-por-mais.vercel.app';
const siteTitle = 'Juntos com Estevão Reis';
const siteDescription = 'Plataforma de Parceiros';
const imageUrl = `${siteUrl}/estevao-reis-perfil2-rounded.png`;

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: '/estevao-reis-perfil2-rounded.png',
  },

  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: imageUrl,
        width: 500,
        height: 500,
        alt: 'Foto de Estevão Reis',
  }, ], },
  
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [imageUrl],
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
      .eq('auth_id', user.id)
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
); }