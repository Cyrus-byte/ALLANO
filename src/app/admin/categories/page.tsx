
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/category-service';
import type { Category } from '@/lib/types';
import { Loader2, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAttributes, setNewCategoryAttributes] = useState({ sizes: false, shoeSizes: false });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryAttributes, setEditingCategoryAttributes] = useState({ sizes: false, shoeSizes: false });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({ title: "Erreur", description: "Impossible de charger les catégories.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({ title: "Champ vide", description: "Le nom de la catégorie ne peut pas être vide.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createCategory(newCategoryName, newCategoryAttributes);
      toast({ title: "Succès", description: `La catégorie "${newCategoryName}" a été ajoutée.` });
      setNewCategoryName('');
      setNewCategoryAttributes({ sizes: false, shoeSizes: false });
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Failed to create category:", error);
      toast({ title: "Erreur", description: "La création de la catégorie a échoué.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
    setEditingCategoryAttributes(category.attributes || { sizes: false, shoeSizes: false });
    setIsEditModalOpen(true);
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateCategory(editingCategory.id, editingCategoryName, editingCategoryAttributes);
      toast({ title: "Succès", description: "Catégorie mise à jour." });
      fetchCategories();
      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to update category:", error);
      toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({ title: "Succès", description: "La catégorie a été supprimée." });
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({ title: "Erreur", description: "La suppression a échoué. Assurez-vous qu'aucun produit n'utilise cette catégorie.", variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto px-2 py-8 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une catégorie</CardTitle>
                    <CardDescription>Créez une nouvelle catégorie et définissez ses attributs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newCategory">Nom de la catégorie</Label>
                            <Input
                            id="newCategory"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Ex: Vêtements"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attributs de la catégorie</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="new-sizes" checked={newCategoryAttributes.sizes} onCheckedChange={(checked) => setNewCategoryAttributes(prev => ({...prev, sizes: !!checked}))} />
                                <Label htmlFor="new-sizes" className="font-normal">A des tailles (S, M, L...)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="new-shoeSizes" checked={newCategoryAttributes.shoeSizes} onCheckedChange={(checked) => setNewCategoryAttributes(prev => ({...prev, shoeSizes: !!checked}))}/>
                                <Label htmlFor="new-shoeSizes" className="font-normal">A des pointures (39, 40...)</Label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-8">Gérer les catégories</h1>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Attributs</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                            Array.from({length: 4}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {category.attributes?.sizes && "Tailles "}
                                    {category.attributes?.shoeSizes && "Pointures "}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Dialog open={isEditModalOpen && editingCategory?.id === category.id} onOpenChange={(isOpen) => { if(!isOpen) setEditingCategory(null); setIsEditModalOpen(isOpen); }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => handleEditClick(category)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Modifier la catégorie</DialogTitle>
                                                <DialogDescription>
                                                   Renommez la catégorie et ajustez ses attributs.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="name" className="text-right">Nom</Label>
                                                  <Input id="name" value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label className="text-right">Attributs</Label>
                                                  <div className="col-span-3 space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="edit-sizes" checked={editingCategoryAttributes.sizes} onCheckedChange={(checked) => setEditingCategoryAttributes(prev => ({...prev, sizes: !!checked}))} />
                                                        <Label htmlFor="edit-sizes" className="font-normal">A des tailles (S, M, L...)</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="edit-shoeSizes" checked={editingCategoryAttributes.shoeSizes} onCheckedChange={(checked) => setEditingCategoryAttributes(prev => ({...prev, shoeSizes: !!checked}))}/>
                                                        <Label htmlFor="edit-shoeSizes" className="font-normal">A des pointures (39, 40...)</Label>
                                                    </div>
                                                  </div>
                                                </div>
                                            </div>
                                             <DialogFooter>
                                                <Button type="submit" onClick={handleUpdateCategory} disabled={isSubmitting}>
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Enregistrer
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

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
                                                Cette action est irréversible. La catégorie "{category.name}" sera définitivement supprimée.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
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
                                <TableCell colSpan={3} className="h-24 text-center">Aucune catégorie trouvée.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
