
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '@/lib/promo-code-service';
import type { PromoCode } from '@/lib/types';
import { Loader2, Pencil, Trash2, PlusCircle, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newCodeType, setNewCodeType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCodeValue, setNewCodeValue] = useState('');
  const [newCodeExpiresAt, setNewCodeExpiresAt] = useState<Date | undefined>();

  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const fetchedCodes = await getPromoCodes();
      setPromoCodes(fetchedCodes);
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
      toast({ title: "Erreur", description: "Impossible de charger les codes promo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleAddCode = async () => {
    if (!newCode.trim() || !newCodeValue) {
      toast({ title: "Champs vides", description: "Le code et sa valeur sont requis.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createPromoCode({
        id: newCode.trim().toUpperCase(),
        type: newCodeType,
        value: parseFloat(newCodeValue),
        expiresAt: newCodeExpiresAt,
      });
      toast({ title: "Succès", description: `Le code "${newCode}" a été ajouté.` });
      setNewCode('');
      setNewCodeType('percentage');
      setNewCodeValue('');
      setNewCodeExpiresAt(undefined);
      setIsAddModalOpen(false);
      fetchPromoCodes();
    } catch (error: any) {
      console.error("Failed to create promo code:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateCode = async (codeId: string, data: Partial<PromoCode>) => {
    setIsSubmitting(true);
    try {
      await updatePromoCode(codeId, data);
      toast({ title: "Succès", description: "Code promo mis à jour." });
      fetchPromoCodes();
      setEditingPromoCode(null);
    } catch (error) {
      console.error("Failed to update promo code:", error);
      toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await deletePromoCode(codeId);
      toast({ title: "Succès", description: "Le code promo a été supprimé." });
      fetchPromoCodes();
    } catch (error) {
      console.error("Failed to delete promo code:", error);
      toast({ title: "Erreur", description: "La suppression a échoué.", variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gérer les Codes Promo</h1>
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un code
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau code promo</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Code (ex: SUMMER20)</Label>
                          <Input id="code" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="type">Type de réduction</Label>
                                <Select value={newCodeType} onValueChange={(v: any) => setNewCodeType(v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                                        <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Valeur</Label>
                                <Input id="value" type="number" value={newCodeValue} onChange={(e) => setNewCodeValue(e.target.value)} />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newCodeExpiresAt ? format(newCodeExpiresAt, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={newCodeExpiresAt} onSelect={setNewCodeExpiresAt} initialFocus />
                                </PopoverContent>
                            </Popover>
                         </div>
                    </div>
                     <DialogFooter>
                        <Button type="submit" onClick={handleAddCode} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer le code
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        Array.from({length: 4}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-1/4" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : promoCodes.length > 0 ? (
                        promoCodes.map((code) => (
                            <TableRow key={code.id}>
                            <TableCell className="font-medium"><Badge><Tag className="mr-2 h-3 w-3"/>{code.id}</Badge></TableCell>
                            <TableCell className="capitalize">{code.type === 'fixed' ? 'Montant Fixe' : 'Pourcentage'}</TableCell>
                            <TableCell>
                                {code.type === 'percentage' 
                                    ? `${code.value}%` 
                                    : `${code.value.toLocaleString('fr-FR')} FCFA`}
                            </TableCell>
                             <TableCell>
                                {code.expiresAt ? format(code.expiresAt.toDate(), 'dd/MM/yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Le code "{code.id}" sera définitivement supprimé.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCode(code.id)}>
                                            Continuer
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">Aucun code promo trouvé.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
