import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFamily } from '@/hooks/useFamily';

interface MealPlanDialogProps {
  mealPlan?: any;
  trigger: React.ReactNode;
}

export const MealPlanDialog = ({ mealPlan, trigger }: MealPlanDialogProps) => {
  const [open, setOpen] = useState(false);
  const formatToInputDate = (d: any) => {
    try {
      if (!d) return '';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      return format(dt, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const [date, setDate] = useState(mealPlan?.date ? formatToInputDate(mealPlan.date) : format(new Date(), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState(mealPlan?.meal_type || 'breakfast');
  const [recipeId, setRecipeId] = useState<string>(mealPlan?.recipe_id ? String(mealPlan.recipe_id) : '');
  const [notes, setNotes] = useState(mealPlan?.notes || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: familyData } = useFamily();

  const { data: recipes } = useQuery({
    queryKey: ['recipes', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('family_id', familyData.family_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!familyData?.family_id,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mealPlan) {
        const { error } = await supabase
          .from('meal_plans')
          .update(data)
          .eq('id', mealPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meal_plans')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: mealPlan ? 'Meal plan diupdate' : 'Meal plan ditambahkan',
        description: 'Meal plan berhasil disimpan',
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as any)?.message || String(error),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    if (!mealPlan) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setMealType('breakfast');
      setRecipeId('');
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyData?.family_id) {
      toast({
        title: 'Error',
        description: 'Family ID tidak ditemukan',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Error',
        description: 'Tanggal harus diisi',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      date,
      meal_type: mealType,
      recipe_id: recipeId ? Number(recipeId) : null,
      notes: notes || null,
      family_id: familyData.family_id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mealPlan ? 'Edit Meal Plan' : 'Tambah Meal Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="mealType">Jenis Makanan</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis makanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Sarapan</SelectItem>
                <SelectItem value="lunch">Makan Siang</SelectItem>
                <SelectItem value="dinner">Makan Malam</SelectItem>
                <SelectItem value="snack">Camilan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipe">Resep (Opsional)</Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih resep" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tanpa Resep</SelectItem>
                {recipes?.map((recipe) => (
                  <SelectItem key={recipe.id} value={String(recipe.id)}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
