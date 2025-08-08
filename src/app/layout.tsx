
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { AuthProvider } from '@/contexts/auth-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Allano',
  description: 'Votre boutique en ligne de mode au Burkina Faso',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <MobileNav />
                </div>
                <Toaster />
              </CartProvider>
            </WishlistProvider>
        </AuthProvider>
        <Script
            id="cinetpay-sdk"
            src="https://cdn.cinetpay.com/seamless/main.js"
            strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
