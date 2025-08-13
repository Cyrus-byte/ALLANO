
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, ShoppingCart, User, Loader2, Plus, List, LayoutGrid, Settings, Camera, Tag } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/auth-context';


export function Header() {
  const { totalItems, loading: cartLoading } = useCart();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <header className="hidden md:block sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {isClient && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Admin</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Gestion du site</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                      <Link href="/admin/orders">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span>Commandes</span>
                      </Link>
                  </DropdownMenuItem>
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
                      <Link href="/admin/promo-codes">
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Codes Promo</span>
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
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
               <button type="submit" className="p-0 m-0 h-full bg-transparent border-none">
                <Search className="h-5 w-5 text-muted-foreground" />
               </button>
            </div>
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className="pl-10 pr-10 h-9 rounded-full bg-muted border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Link href="/visual-search" aria-label="Recherche visuelle">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                </Link>
            </div>
          </form>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="Liste de souhaits">
              <Link href="/wishlist">
                <div className="relative">
                  {cartLoading ? <Loader2 className="animate-spin"/> : <Heart />}
                  {!cartLoading && wishlist.length > 0 && (
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
