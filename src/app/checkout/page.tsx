
"use client";

import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/order-service';
import type { Order } from '@/lib/types';


declare global {
    interface Window {
        CinetPay: any;
    }
}

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ouagadougou');
  const [phone, setPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

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

    setPaymentLoading(true);

    const transactionId = `ALLANO-${Date.now()}`;
    const shippingCost = totalItems > 0 ? 2000 : 0;
    const grandTotal = totalPrice + shippingCost;
    
    try {
        window.CinetPay.setConfig({
            apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
            site_id: parseInt(process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '0'),
            notify_url: window.location.origin,
            mode: 'PRODUCTION'
        });

        window.CinetPay.getCheckout({
            transaction_id: transactionId,
            amount: grandTotal,
            currency: 'XOF',
            channels: 'ALL',
            description: `Achat sur Allano - Commande ${transactionId}`,
            customer_name: firstName,
            customer_surname: lastName,
            customer_email: user?.email,
            customer_phone_number: phone,
            customer_address: address,
            customer_city: city,
            customer_country: 'BF',
            customer_zip_code: '01'
        });

        window.CinetPay.waitResponse(async (data: any) => {
            if (data.status === "REFUSED") {
                toast({ title: "Paiement refusé", description: "Votre paiement a été refusé.", variant: "destructive" });
                setPaymentLoading(false);
            } else if (data.status === "ACCEPTED") {
                try {
                     const orderData: Omit<Order, 'id' | 'createdAt'> = {
                        userId: user.uid,
                        items: cart.map(({ product, ...rest }) => rest),
                        shippingDetails: { firstName, lastName, address, city, phone },
                        totalAmount: grandTotal,
                        status: 'Payée',
                        paymentDetails: data,
                    };

                    await createOrder(orderData);
                    
                    toast({ title: "Paiement réussi", description: "Merci pour votre commande !" });
                    clearCart();
                    router.push('/account');
                } catch (orderError) {
                     console.error("Erreur lors de la création de la commande:", orderError);
                     toast({ title: "Erreur de commande", description: "Votre paiement a réussi, mais nous n'avons pas pu enregistrer votre commande. Veuillez nous contacter.", variant: "destructive" });
                } finally {
                    setPaymentLoading(false);
                }
            }
        });

        window.CinetPay.onError(function(err: any) {
            console.error('CinetPay Error:', err);
            toast({ title: "Erreur de paiement", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
            setPaymentLoading(false);
        });

    } catch(e) {
        console.error("CinetPay initialization error", e);
        toast({ title: "Erreur", description: "Impossible d'initialiser le paiement.", variant: "destructive" });
        setPaymentLoading(false);
    }
  }

  const isLoading = cartLoading || authLoading;
  const shippingCost = totalItems > 0 ? 2000 : 0;
  const grandTotal = totalPrice + shippingCost;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="Ex: 123 Rue de la Soie, Secteur 15" value={address} onChange={e => setAddress(e.target.value)} required />
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
                                <CldImage src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
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
                     <div className="flex justify-between text-sm">
                        <span>Livraison</span>
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
