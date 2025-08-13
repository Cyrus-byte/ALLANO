
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { getOrderById, updateOrderStatus } from '@/lib/order-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, User as UserIcon, Loader2, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!user || !orderId) return;
            setLoading(true);
            try {
                const fetchedOrder = await getOrderById(orderId);
                // Security check: ensure the user owns the order or is an admin
                if (fetchedOrder && (fetchedOrder.userId === user.uid || isAdmin)) {
                    setOrder(fetchedOrder);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
             if (!user) {
                router.push('/login');
                return;
            }
            fetchOrder();
        }
    }, [orderId, user, isAdmin, authLoading, router]);

    const handleStatusChange = async (newStatus: Order['status']) => {
        if (!isAdmin || !order) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, newStatus);
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            toast({ title: "Statut mis à jour", description: "Le statut de la commande a été changé." });
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    }
    
    if (loading || authLoading) {
        return (
            <div className="container mx-auto px-2 py-8 md:py-12">
                <Skeleton className="h-8 w-40 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="md:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!order) return null; // Should be handled by notFound, but as a safeguard.
    
    const shippingCost = 300;
    const subtotal = order.totalAmount - shippingCost + (order.promoCode?.discount || 0);

    return (
        <div className="container mx-auto px-2 py-8 md:py-12">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/account">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à mes commandes
                    </Link>
                </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commande #{order.id.substring(0, 8)}...</CardTitle>
                            <CardDescription>
                                Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.quantity} x Article (ID: {item.productId.substring(0,6)}...)</p>
                                            <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails de livraison</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{order.shippingDetails.firstName} {order.shippingDetails.lastName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{order.shippingDetails.address}, {order.shippingDetails.city}</span>
                            </div>
                            {order.shippingDetails.indication && (
                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>{order.shippingDetails.indication}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{order.shippingDetails.phone}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Total</CardTitle>
                                <Badge variant={order.status === 'Livrée' ? 'secondary' : order.status === 'Annulée' ? 'destructive' : 'default'} className="mt-1">
                                    {order.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                             {order.promoCode && (
                                <div className="flex justify-between text-destructive">
                                    <span>Réduction ({order.promoCode.code})</span>
                                    <span>- {order.promoCode.discount.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                             )}
                             <div className="flex justify-between">
                                <span>Livraison</span>
                                <span>{shippingCost.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>{order.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                        </CardContent>
                         {isAdmin && (
                            <CardFooter className="flex-col gap-2">
                                <Label className="text-xs text-muted-foreground self-start">Changer le statut (Admin)</Label>
                                <Select onValueChange={(value: Order['status']) => handleStatusChange(value)} defaultValue={order.status} disabled={isUpdating}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Payée">Payée</SelectItem>
                                        <SelectItem value="Expédiée">Expédiée</SelectItem>
                                        <SelectItem value="Livrée">Livrée</SelectItem>
                                        <SelectItem value="Annulée">Annulée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsPage;
