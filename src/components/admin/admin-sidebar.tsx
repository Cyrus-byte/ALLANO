
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Users, Package, Tag, Settings, LayoutGrid, Plus, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons';

const adminNavItems = [
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/upload', label: 'Ajouter un produit', icon: Plus },
  { href: '/admin/products', label: 'Gérer les produits', icon: List },
  { href: '/admin/categories', label: 'Gérer les catégories', icon: LayoutGrid },
  { href: '/admin/promo-codes', label: 'Codes Promo', icon: Tag },
  { href: '/admin/settings', label: 'Personnalisation', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo className="h-6 w-auto" />
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {adminNavItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isActive && "bg-muted text-primary"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    </aside>
  );
}
