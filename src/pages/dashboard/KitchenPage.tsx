import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Plus, ShoppingCart, Trash2, Edit, ChefHat, Calendar, Search } from 'lucide-react';
import { RecipeDialog } from '@/components/recipes/RecipeDialog';
import { MealPlanDialog } from '@/components/recipes/MealPlanDialog';
import { RecipeTemplateCard } from '@/components/recipes/RecipeTemplateCard';
import { RecipeTemplatePreview } from '@/components/recipes/RecipeTemplatePreview';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingListDialog } from '@/components/shopping/ShoppingListDialog';
import { ShoppingItemDialog } from '@/components/shopping/ShoppingItemDialog';
import { toast } from '@/hooks/use-toast';
import { recipeTemplates, RECIPE_CATEGORIES, RecipeTemplate } from '@/data/recipeTemplates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const KitchenPage = () => {
  const { data: family } = useFamily();
  const queryClient = useQueryClient();
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [previewRecipe, setPreviewRecipe] = useState<RecipeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', family?.family_id],
    queryFn: async () => {
      if (!family?.family_id) return [];
      const { data, error } = await supabase.from('recipes').select('*').eq('family_id', family.family_id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!family?.family_id,
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['meal-plans', family?.family_id],
    queryFn: async () => {
      if (!family?.family_id) return [];
      const { data, error } = await supabase.from('meal_plans').select('*, recipes(name)').eq('family_id', family.family_id).order('date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!family?.family_id,
  });

  // Fetch shopping lists
  const { data: shoppingLists, isLoading } = useQuery({
    queryKey: ['shopping-lists', family?.family_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('family_id', family?.family_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!family?.family_id,
  });

  // Fetch items for selected list
  const { data: items } = useQuery({
    queryKey: ['shopping-items', selectedList],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('shopping_list_id', selectedList)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedList,
  });

  // Toggle item checked
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from('shopping_items')
        .update({ checked })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
  });

  // Delete list
  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Resep dihapus',
        description: 'Resep berhasil dihapus',
      });
    },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: 'Meal plan dihapus',
        description: 'Meal plan berhasil dihapus',
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast({ title: 'Berhasil', description: 'Daftar belanja berhasil dihapus' });
      if (selectedList === deleteListId) setSelectedList(null);
      setDeleteListId(null);
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      toast({ title: 'Berhasil', description: 'Item berhasil dihapus' });
      setDeleteItemId(null);
    },
  });

  const handleEditList = (list: any) => {
    setEditingList(list);
    setListDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  // Add template recipe to user's collection
  const addTemplateMutation = useMutation({
    mutationFn: async (template: RecipeTemplate) => {
      if (!family?.family_id) throw new Error('No family');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('recipes').insert({
        name: template.name,
        description: template.description,
        ingredients: template.ingredients,
        instructions: template.instructions,
        prep_time: template.prep_time,
        cook_time: template.cook_time,
        servings: template.servings,
        family_id: family.family_id,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Berhasil!',
        description: 'Resep berhasil ditambahkan ke koleksi Anda',
      });
    },
    onError: () => {
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menambahkan resep',
        variant: 'destructive',
      });
    },
  });

  // Filter templates
  const filteredTemplates = recipeTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if recipe already added
  const isRecipeAdded = (templateId: string) => {
    return recipes.some((recipe) => recipe.name === recipeTemplates.find((t) => t.id === templateId)?.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-8 w-8 text-primary" />
            Dapur & Belanja
          </h1>
          <p className="text-muted-foreground mt-2">
            Rencanakan menu dan kelola daftar belanja
          </p>
        </div>
        <Button onClick={() => { setEditingList(null); setListDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Daftar Baru
        </Button>
      </div>

      <Tabs defaultValue="shopping" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shopping">Daftar Belanja</TabsTrigger>
          <TabsTrigger value="recipes">Resep</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shopping Lists Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daftar Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : shoppingLists && shoppingLists.length > 0 ? (
                  shoppingLists.map((list: any) => (
                    <div
                      key={list.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                        selectedList === list.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div onClick={() => setSelectedList(list.id)} className="flex-1">
                          <p className="font-medium">{list.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(list.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditList(list);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteListId(list.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada daftar belanja
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Shopping Items */}
            <div className="lg:col-span-2">
              {selectedList ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Item Belanja</CardTitle>
                        <CardDescription>
                          Kelola item dalam daftar belanja
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingItem(null);
                          setItemDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {items && items.length > 0 ? (
                      <div className="space-y-2">
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={(checked) =>
                                toggleItemMutation.mutate({
                                  id: item.id,
                                  checked: !!checked,
                                })
                              }
                            />
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  item.checked ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {item.name}
                              </p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {item.quantity && <span>{item.quantity}</span>}
                                {item.category && <span>• {item.category}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteItemId(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada item dalam daftar</p>
                        <p className="text-sm mt-2">Tambahkan item yang perlu dibeli</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Pilih daftar belanja untuk melihat item</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4 sm:space-y-6">
          {/* Resep Saya */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Resep Saya</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Koleksi resep pribadi keluarga</p>
              </div>
              <RecipeDialog trigger={<Button size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" />Tambah Resep</Button>} />
            </div>
            {recipes.length === 0 ? (
              <Card><CardContent className="py-8 sm:py-12"><div className="text-center text-muted-foreground"><ChefHat className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" /><p className="text-sm sm:text-base">Belum ada resep</p><p className="text-xs sm:text-sm mt-1 sm:mt-2">Tambahkan resep sendiri atau pilih dari template</p></div></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {recipes.map((r) => (
                  <Card key={r.id}><CardHeader className="pb-3"><div className="flex justify-between gap-2"><div className="flex-1 min-w-0"><CardTitle className="text-base sm:text-lg line-clamp-1">{r.name}</CardTitle><p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{r.description}</p></div><div className="flex gap-1 flex-shrink-0"><RecipeDialog recipe={r} trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3 w-3 sm:h-4 sm:w-4" /></Button>} /><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRecipeMutation.mutate(r.id)}><Trash2 className="h-3 w-3 sm:h-4 sm:w-4" /></Button></div></div></CardHeader></Card>
                ))}
              </div>
            )}
          </div>

          {/* Template Resep */}
          <div>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Template Resep Populer</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Pilih resep masakan Indonesia yang mudah dan praktis</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari resep..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="text-sm">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Grid */}
            {filteredTemplates.length === 0 ? (
              <Card><CardContent className="py-8 sm:py-12"><div className="text-center text-muted-foreground"><ChefHat className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" /><p className="text-sm sm:text-base">Tidak ada resep yang sesuai</p></div></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredTemplates.map((template) => (
                  <RecipeTemplateCard
                    key={template.id}
                    recipe={template}
                    onPreview={setPreviewRecipe}
                    onAddToCollection={(recipe) => addTemplateMutation.mutate(recipe)}
                    isAdded={isRecipeAdded(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meal-plan" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Meal Plan</h3>
            <MealPlanDialog trigger={<Button><Plus className="h-4 w-4 mr-2" />Tambah Plan</Button>} />
          </div>
          {mealPlans.length === 0 ? (
            <Card><CardContent className="py-12"><div className="text-center text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada meal plan</p></div></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {mealPlans.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {p.date ? `${format(new Date(p.date), 'dd MMM yyyy')} - ${p.meal_type}` : p.meal_type}
                        </CardTitle>
                        {p.recipes && <CardDescription>{p.recipes.name}</CardDescription>}
                      </div>
                      <div className="flex gap-1">
                        <MealPlanDialog mealPlan={p} trigger={<Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>} />
                        <Button variant="ghost" size="icon" onClick={() => deleteMealPlanMutation.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ShoppingListDialog
        open={listDialogOpen}
        onOpenChange={(open) => {
          setListDialogOpen(open);
          if (!open) setEditingList(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
        }}
        editData={editingList}
      />

      {selectedList && (
        <ShoppingItemDialog
          open={itemDialogOpen}
          onOpenChange={(open) => {
            setItemDialogOpen(open);
            if (!open) setEditingItem(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
          }}
          listId={selectedList}
          editData={editingItem}
        />
      )}

      {/* Recipe Template Preview */}
      <RecipeTemplatePreview
        recipe={previewRecipe}
        open={!!previewRecipe}
        onOpenChange={(open) => !open && setPreviewRecipe(null)}
        onAddToCollection={(recipe) => addTemplateMutation.mutate(recipe)}
        isAdded={previewRecipe ? isRecipeAdded(previewRecipe.id) : false}
      />

      {/* Delete Confirmations */}
      <AlertDialog
        open={!!deleteListId}
        onOpenChange={(open) => !open && setDeleteListId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Daftar Belanja?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua item dalam daftar ini akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListId && deleteListMutation.mutate(deleteListId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemId && deleteItemMutation.mutate(deleteItemId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KitchenPage;
