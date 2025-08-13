
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from '@/components/ui/skeleton';
import { getOrdersByUserId } from '@/lib/order-service';
import type { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


export default function AccountPage() {
    const { user, userProfile, loading: authLoading, logOut, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);
    
    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setPhone(userProfile.phone || '');
            setAddress(userProfile.address || '');
        } else if (user?.displayName) {
             const nameParts = user.displayName.split(' ');
             setFirstName(nameParts[0] || '');
             setLastName(nameParts.slice(1).join(' ') || '');
        }

    }, [userProfile, user]);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setOrdersLoading(true);
                try {
                    const userOrders = await getOrdersByUserId(user.uid);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setOrdersLoading(false);
                }
            };
            fetchOrders();
        }
    }, [user]);

    const handleProfileSave = async () => {
      setIsSavingProfile(true);
      try {
        await updateUserProfile({ firstName, lastName, phone, address });
        toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées avec succès." });
      } catch (error) {
        console.error(error);
        toast({ title: "Erreur", description: "Impossible d'enregistrer les modifications.", variant: "destructive" });
      } finally {
        setIsSavingProfile(false);
      }
    };

    const isLoading = authLoading || !user;

    if (isLoading) {
        return (
            <div className="container mx-auto px-2 py-8 md:py-12">
                <Skeleton className="h-12 w-1/3 mb-8" />
                <div className="w-full">
                    <Skeleton className="h-10 w-1/3 mb-6" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-2 py-8 md:py-12">
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Mon Compte</h1>
        <Button onClick={logOut} variant="outline">Se déconnecter</Button>
      </div>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>Consultez l'état et les détails de vos commandes récentes.</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-bold">#{order.id.substring(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('fr-FR')} - {order.items.reduce((acc, item) => acc + item.quantity, 0)} article(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                        <Badge variant={order.status === 'Livrée' ? 'secondary' : order.status === 'Annulée' ? 'destructive' : 'default'} className="mt-1">
                          {order.status}
                        </Badge>
                      </div>
                       <Button asChild variant="outline" size="sm">
                          <Link href={`/account/order/${order.id}`}>Voir les détails</Link>
                       </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles ici.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ''} readOnly disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 XX XX XX XX" />
              </div>
               <div className="space-y-1">
                <Label htmlFor="address">Quartier de résidence</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Saaba" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer les modifications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
