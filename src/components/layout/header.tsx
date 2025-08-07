
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, ShoppingCart, User, Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { totalItems, loading: cartLoading } = useCart();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');


  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/categories', label: 'Catégories' },
    { href: '/promotions', label: 'Promotions' },
    { href: '/admin/upload', label: 'Admin' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
               <button type="submit" className="p-0 m-0 h-full bg-transparent border-none">
                <Search className="h-5 w-5 text-muted-foreground" />
               </button>
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild aria-label="Liste de souhaits">
              <Link href="/wishlist">
                <div className="relative">
                  {wishlistLoading ? <Loader2 className="animate-spin"/> : <Heart />}
                  {!wishlistLoading && wishlist.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                      {wishlist.length}
                    </Badge>
                  )}
                </div>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Panier">
              <Link href="/cart">
                <div className="relative">
                  {cartLoading ? <Loader2 className="animate-spin"/> : <ShoppingCart />}
                  {!cartLoading && totalItems > 0 && (
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
