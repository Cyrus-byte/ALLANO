
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, ShoppingCart, User, Loader2, Plus, List, LayoutGrid, Settings } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';


export function Header() {
  const { totalItems, loading: cartLoading } = useCart();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = pathname === '/';

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/categories', label: 'Catégories' },
    { href: '/promotions', label: 'Promotions' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={cn(
        "hidden w-full md:block z-40 transition-colors duration-300",
        isHomePage 
            ? "absolute top-0 border-transparent bg-gradient-to-b from-black/70 to-transparent text-white" 
            : "sticky top-0 bg-background text-foreground border-b"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn("transition-colors", isHomePage ? "text-white/80 hover:text-white/100" : "text-muted-foreground hover:text-foreground")}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn("transition-colors px-0", isHomePage ? "text-white/80 hover:text-white/100 hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>Admin</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Gestion du site</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                      <Link href="/admin/upload">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Ajouter un produit</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/admin/products">
                          <List className="mr-2 h-4 w-4" />
                          <span>Gérer les produits</span>
                      </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                      <Link href="/admin/categories">
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          <span>Gérer les catégories</span>
                      </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                      <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Personnalisation</span>
                      </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        <div className="flex items-center justify-end gap-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-xs">
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className={cn(
                "pl-10 rounded-full h-9", 
                isHomePage 
                  ? "bg-white/20 placeholder:text-white/70 border-white/30 text-white focus:bg-white/30" 
                  : "bg-muted placeholder:text-muted-foreground border-transparent"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
               <button type="submit" className="p-0 m-0 h-full bg-transparent border-none">
                <Search className={cn("h-5 w-5", isHomePage ? "text-white/70" : "text-muted-foreground")} />
               </button>
            </div>
          </form>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="Liste de souhaits" className={cn(isHomePage && "hover:bg-white/10 text-white/80 hover:text-white/100")}>
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
            <Button variant="ghost" size="icon" asChild aria-label="Panier" className={cn(isHomePage && "hover:bg-white/10 text-white/80 hover:text-white/100")}>
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
            <Button variant="ghost" size="icon" asChild aria-label="Compte utilisateur" className={cn(isHomePage && "hover:bg-white/10 text-white/80 hover:text-white/100")}>
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
