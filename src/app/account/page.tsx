
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from '@/components/ui/skeleton';

const orders = [
  { id: 'ORD-00124', date: '12 Juil. 2024', total: 41500, status: 'Livré', items: 2 },
  { id: 'ORD-00119', date: '28 Juin 2024', total: 9500, status: 'Livré', items: 1 },
  { id: 'ORD-00105', date: '05 Mai 2024', total: 55000, status: 'Annulé', items: 1 },
];

export default function AccountPage() {
    const { user, loading, logOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
    
    const [firstName, lastName] = user.displayName?.split(' ') || ['',''];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Mon Compte</h1>
        <Button onClick={logOut} variant="outline">Se déconnecter</Button>
      </div>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          <TabsTrigger value="addresses">Mes Adresses</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>Consultez l'état et les détails de vos commandes récentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-bold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date} - {order.items} article(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.total.toLocaleString('fr-FR')} FCFA</p>
                      <Badge variant={order.status === 'Livré' ? 'secondary' : order.status === 'Annulé' ? 'destructive' : 'default'} className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">Voir les détails</Button>
                  </div>
                ))}
              </div>
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
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email || ''} readOnly />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Enregistrer les modifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Adresses de livraison</CardTitle>
              <CardDescription>Gérez vos adresses de livraison pour un paiement plus rapide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="border p-4 rounded-lg">
                   <p className="font-semibold">Adresse principale</p>
                   <p className="text-muted-foreground">123 Rue de la Mode, Ouagadougou, Burkina Faso</p>
                   <p className="text-muted-foreground">(+226) 70 00 00 00</p>
                   <div className="mt-2">
                       <Button variant="outline" size="sm" className="mr-2">Modifier</Button>
                       <Button variant="ghost" size="sm" className="text-destructive">Supprimer</Button>
                   </div>
               </div>
            </CardContent>
            <CardFooter>
                <Button>Ajouter une nouvelle adresse</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
