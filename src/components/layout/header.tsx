
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, ShoppingCart, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useCart } from '@/contexts/cart-context';

export function Header() {
  const { totalItems } = useCart();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/#categories', label: 'Catégories' },
    { href: '/#promotions', label: 'Promotions' },
  ];

  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold">Allano</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative w-full max-w-sm">
            <Input type="search" placeholder="Rechercher un produit..." className="pl-10" />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Liste de souhaits">
              <Heart />
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Panier">
              <Link href="/cart">
                <div className="relative">
                  <ShoppingCart />
                  {totalItems > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                      {totalItems}
                    </Badge>
                  )}
                </div>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Compte utilisateur">
              <Link href="/account">
                <User />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
