import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Nama item harus diisi').max(100, 'Nama terlalu panjang'),
  quantity: z.string().optional(),
  category: z.string().optional(),
});

interface ShoppingItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  listId: string;
  editData?: any;
}

export const ShoppingItemDialog = ({ open, onOpenChange, onSuccess, listId, editData }: ShoppingItemDialogProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editData?.name || '',
      quantity: editData?.quantity || '',
      category: editData?.category || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      if (editData) {
        // Update
        const { error } = await supabase
          .from('shopping_items')
          .update(values)
          .eq('id', editData.id);

        if (error) throw error;

        toast({
          title: 'Berhasil',
          description: 'Item berhasil diupdate',
        });
      } else {
        // Create
        const { error } = await supabase
          .from('shopping_items')
          .insert({
            shopping_list_id: listId,
            name: values.name,
            quantity: values.quantity || null,
            category: values.category || null,
          });

        if (error) throw error;

        toast({
          title: 'Berhasil',
          description: 'Item berhasil ditambahkan',
        });
      }

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Item' : 'Tambah Item Baru'}</DialogTitle>
          <DialogDescription>
            {editData ? 'Ubah detail item' : 'Tambahkan item ke daftar belanja'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Beras 5kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="2 pcs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sembako" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editData ? 'Update' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
