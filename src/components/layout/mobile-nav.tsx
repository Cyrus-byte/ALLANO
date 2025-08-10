
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User, Heart, Tag, Loader2, Plus, List, Settings, PanelLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export function MobileNav() {
  const pathname = usePathname();
  const { totalItems, loading: cartLoading } = useCart();
  const { wishlist, loading: wishlistLoading } = useWishlist();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, exact: true },
    { href: '/categories', label: 'Catégories', icon: LayoutGrid },
    { href: '/promotions', label: 'Promos', icon: Tag },
    { href: '/wishlist', label: 'Favoris', icon: Heart, loading: wishlistLoading, count: wishlist.length },
    { href: '/cart', label: 'Panier', icon: ShoppingCart, loading: cartLoading, count: totalItems },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 pb-safe border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="grid h-full grid-cols-7">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
              <div className="relative">
                {item.loading ? <Loader2 className={cn("h-6 w-6 animate-spin", isActive ? "text-primary" : "text-muted-foreground")} /> : <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />}
                {!item.loading && typeof item.count !== 'undefined' && item.count > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0">
                    {item.count}
                  </Badge>
                )}
              </div>
              <span className={cn("text-xs text-center", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          );
        })}
         <Sheet>
            <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
                    <PanelLeft className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-center text-muted-foreground">Admin</span>
                </button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                <SheetTitle>Admin</SheetTitle>
                <SheetDescription>
                    Gérez votre boutique en ligne.
                </SheetDescription>
                </SheetHeader>
                 <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/admin/upload">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Ajouter un produit</span>
                        </Link>
                    </Button>
                     <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/admin/products">
                            <List className="mr-2 h-4 w-4" />
                            <span>Gérer les produits</span>
                        </Link>
                    </Button>
                     <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/admin/categories">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            <span>Gérer les catégories</span>
                        </Link>
                    </Button>
                     <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/admin/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Personnalisation</span>
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
         <Link href="/account" className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            <User className={cn("h-6 w-6", pathname.startsWith('/account') ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-xs text-center", pathname.startsWith('/account') ? "text-primary" : "text-muted-foreground")}>Profil</span>
        </Link>
      </nav>
    </div>
  );
}
