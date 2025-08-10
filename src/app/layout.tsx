
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { MobileHeader } from '@/components/layout/mobile-header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { AuthProvider } from '@/contexts/auth-context';
import Script from 'next/script';
import { Inter, Cinzel } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

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
      <body className={`${inter.variable} ${cinzel.variable} font-body antialiased bg-background text-foreground`}>
        <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <MobileHeader />
                  <main className="flex-1 relative">{children}</main>
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
