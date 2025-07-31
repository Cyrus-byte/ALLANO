
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User, Heart, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';

export function MobileNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, exact: true },
    { href: '/categories', label: 'Catégories', icon: LayoutGrid },
    { href: '/promotions', label: 'Promos', icon: Tag },
    { href: '/wishlist', label: 'Favoris', icon: Heart },
    { href: '/cart', label: 'Panier', icon: ShoppingCart },
    { href: '/account', label: 'Profil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="grid h-full grid-cols-6">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
              <div className="relative">
                <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.href === '/cart' && totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0">
                    {totalItems}
                  </Badge>
                )}
                 {item.href === '/wishlist' && wishlist.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0">
                    {wishlist.length}
                  </Badge>
                )}
              </div>
              <span className={cn("text-xs text-center", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
