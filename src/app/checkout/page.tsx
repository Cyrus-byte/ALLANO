
"use client";

import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createOrder, updateOrderStatus } from '@/lib/order-service';
import type { Order } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';


declare global {
    interface Window {
        CinetPay: any;
    }
}

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [indication, setIndication] = useState('');
  const [city, setCity] = useState('Ouagadougou');
  const [phone, setPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Get promo code info from URL
  const promoCode = searchParams.get('promoCode');
  const discount = Number(searchParams.get('discount')) || 0;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.displayName) {
        const nameParts = user.displayName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [user]);
  
  const shippingCost = totalItems > 0 ? 300 : 0;
  const grandTotal = totalPrice - discount + shippingCost;


  const handlePayment = async () => {
    if(!firstName || !lastName || !address || !phone) {
        toast({
            title: "Formulaire incomplet",
            description: "Veuillez remplir tous les champs de livraison.",
            variant: "destructive",
        });
        return;
    }
     if (!user) {
        toast({ title: "Utilisateur non connecté", description: "Veuillez vous connecter pour continuer.", variant: "destructive" });
        return;
    }

    if (typeof window.CinetPay === 'undefined') {
        toast({
            title: "Service de paiement non prêt",
            description: "Veuillez patienter un instant et réessayer.",
            variant: "destructive",
        });
        return;
    }
    
    const apiKey = process.env.NEXT_PUBLIC_CINETPAY_API_KEY;
    const siteId = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;
    const notifyUrl = process.env.NEXT_PUBLIC_CINETPAY_NOTIFY_URL;


    if (!apiKey || !siteId || !notifyUrl) {
        console.error("Les clés API ou l'URL de notification CinetPay ne sont pas configurées dans le fichier .env.local");
        toast({
            title: "Erreur de configuration",
            description: "Les clés de paiement ou l'URL de notification ne sont pas configurées. Veuillez contacter le support.",
            variant: "destructive"
        });
        return;
    }

    setPaymentLoading(true);

    try {
        // Step 1: Create the order in Firestore with "En attente" status
        const orderData: Omit<Order, 'id' | 'createdAt'> = {
            userId: user.uid,
            items: cart.map(({ product, ...rest }) => rest),
            shippingDetails: { firstName, lastName, address, indication, city, phone },
            totalAmount: grandTotal,
            status: 'En attente', // <-- Important: status is 'En attente'
            ...(promoCode && discount > 0 && { promoCode: { code: promoCode, discount } })
        };
        const orderId = await createOrder(orderData);


        // Step 2: Initialize CinetPay payment
        window.CinetPay.setConfig({
            apikey: apiKey,
            site_id: parseInt(siteId),
            mode: 'PRODUCTION',
            notify_url: notifyUrl
        });

        window.CinetPay.getCheckout({
            transaction_id: orderId, // <-- Use our Firestore order ID as the transaction ID
            amount: grandTotal,
            currency: 'XOF',
            channels: 'ALL',
            description: `Achat sur Allano - Commande ${orderId.substring(0, 8)}`,
            
            // These URLs are for when the user is redirected back to the site
            return_url: `${window.location.origin}/account/order/${orderId}`,
            cancel_url: `${window.location.origin}/cart`,
            
            // Customer data
            customer_name: firstName,
            customer_surname: lastName,
            customer_email: user.email || undefined,
            customer_phone_number: phone,
            customer_address: address,
            customer_city: city,
            customer_country: 'BF',
            customer_zip_code: '01'
        });

        window.CinetPay.waitResponse(async (data: any) => {
            if (data.status === "ACCEPTED") {
                // The client knows the payment was accepted.
                // We clear the cart and redirect. The backend notification will finalize the order status.
                toast({ title: "Paiement réussi", description: "Merci pour votre commande ! Redirection..." });
                clearCart();
                router.push(`/account/order/${orderId}`);
            } else {
                 // If payment is refused or fails on the client side, we can update our order to "Annulée"
                await updateOrderStatus(orderId, 'Annulée');
                toast({ title: "Paiement refusé", description: "Votre paiement a été refusé.", variant: "destructive" });
                setPaymentLoading(false);
            }
        });

        window.CinetPay.onError(async (err: any) => {
            console.error('CinetPay Error: l\'objet erreur est vide, ce qui suggère un problème de configuration (clé API, ID de site) ou un compte non validé.', err);
            // Also mark the order as "Annulée" if there's a technical error
            await updateOrderStatus(orderId, 'Annulée');
            toast({ title: "Erreur de paiement", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
            setPaymentLoading(false);
        });

    } catch(e) {
        console.error("Erreur lors de la création de la commande ou de l'initialisation CinetPay:", e);
        toast({ title: "Erreur", description: "Impossible de créer la commande ou d'initialiser le paiement.", variant: "destructive" });
        setPaymentLoading(false);
    }
  }

  const isLoading = cartLoading || authLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) return null;

  return (
    <div className="container mx-auto px-2 py-8 md:py-12">
       <Button asChild variant="ghost" className="mb-6 pl-0">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>
      <div className="grid md:grid-cols-2 gap-12">
        {/* Shipping Information */}
        <div className="md:order-1">
          <h1 className="text-2xl font-bold mb-6">Informations de livraison</h1>
          <form className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Quartier de résidence</Label>
              <Input id="address" placeholder="Ex: Saaba" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="indication">Indication (bâtiment, point de repère)</Label>
              <Textarea id="indication" placeholder="Ex: non loin du marché de Saaba ou près de la nouvelle mairie..." value={indication} onChange={e => setIndication(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="+226 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:order-2">
           <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {cart.map(item => item.product && (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-16 h-20 rounded-md overflow-hidden border">
                                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                                    {item.quantity}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                            </div>
                            <p className="font-semibold text-sm">
                                {(item.product.onSale ? item.product.salePrice! * item.quantity : item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                    ))}
                </div>
                 <Separator className="my-6" />
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Sous-total</span>
                        <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                     {discount > 0 && (
                        <div className="flex justify-between text-sm text-destructive">
                            <span>Réduction ({promoCode})</span>
                            <span>- {discount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                     )}
                     <div className="flex justify-between text-sm">
                        <span>Livraison (48h)</span>
                        <span>{shippingCost.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                 </div>

            </CardContent>
            <CardFooter>
                 <Button size="lg" className="w-full" onClick={handlePayment} disabled={paymentLoading}>
                    {paymentLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Payer avec CinetPay
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
