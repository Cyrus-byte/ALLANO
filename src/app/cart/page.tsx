
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Tag, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { applyPromoCode } from '@/lib/promo-code-service';
import type { PromoCode } from '@/lib/types';


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, loading } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
        toast({ title: "Code invalide", description: "Veuillez entrer un code promo.", variant: "destructive" });
        return;
    }
    setPromoCodeLoading(true);
    try {
        const result = await applyPromoCode(promoCode.trim().toUpperCase(), totalPrice);
        setAppliedPromo(result.promoCode);
        setDiscount(result.discount);
        toast({ title: "Code appliqué", description: "La réduction a été appliquée à votre commande." });
    } catch (error: any) {
        setAppliedPromo(null);
        setDiscount(0);
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
        setPromoCodeLoading(false);
    }
  }
  
  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscount(0);
    toast({ title: "Code retiré", description: "La réduction a été retirée." });
  }

  const shippingCost = totalItems > 0 ? 2000 : 0;
  const grandTotal = totalPrice - discount + shippingCost;


  if (loading) {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Skeleton className="h-12 w-1/3 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
          </div>
      )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Votre panier est vide</h1>
        <p className="mt-2 text-muted-foreground">Il est temps de faire du shopping !</p>
        <Button asChild className="mt-6">
          <Link href="/">Continuer vos achats</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Votre Panier</h1>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {cart.map(item => item.product && (
              <Card key={item.id} className="flex items-center p-4">
                <div className="relative w-24 h-32 rounded-md overflow-hidden">
                   <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 ml-4">
                  <h2 className="font-semibold">{item.product.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Taille: {item.size} / Couleur: {item.color}
                  </p>
                  <p className="font-bold mt-1">
                    {(item.product.onSale ? item.product.salePrice! : item.product.price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="flex gap-2">
                 <Input 
                    placeholder="Code promo" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo}
                 />
                 <Button onClick={handleApplyPromoCode} disabled={promoCodeLoading || !!appliedPromo}>
                    {promoCodeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Appliquer
                </Button>
               </div>


              <div className="flex justify-between">
                <span>Sous-total ({totalItems} articles)</span>
                <span className="font-semibold">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-destructive">
                    <div className='flex items-center gap-2'>
                        <span>Réduction ({appliedPromo.id})</span>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removePromoCode}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                    <span className="font-semibold">- {discount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="font-semibold">{shippingCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href={`/checkout?promoCode=${appliedPromo?.id || ''}&discount=${discount}`}>Passer au paiement</Link>
              </Button>
               <p className="text-xs text-muted-foreground text-center">Paiements sécurisés par CinetPay</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
