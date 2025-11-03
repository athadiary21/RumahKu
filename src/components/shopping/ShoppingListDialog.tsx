import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';
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
  name: z.string().min(1, 'Nama harus diisi').max(100, 'Nama terlalu panjang'),
});

interface ShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
}

export const ShoppingListDialog = ({ open, onOpenChange, onSuccess, editData }: ShoppingListDialogProps) => {
  const { user } = useAuth();
  const { data: family } = useFamily();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editData?.name || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !family) {
      toast({
        title: 'Error',
        description: 'Anda harus login terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (editData) {
        // Update
        const { error } = await supabase
          .from('shopping_lists')
          .update({ name: values.name })
          .eq('id', editData.id);

        if (error) throw error;

        toast({
          title: 'Berhasil',
          description: 'Daftar belanja berhasil diupdate',
        });
      } else {
        // Create
        const { error } = await supabase
          .from('shopping_lists')
          .insert({
            family_id: family.family_id,
            name: values.name,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: 'Berhasil',
          description: 'Daftar belanja berhasil dibuat',
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
          <DialogTitle>{editData ? 'Edit Daftar Belanja' : 'Buat Daftar Belanja Baru'}</DialogTitle>
          <DialogDescription>
            {editData ? 'Ubah nama daftar belanja' : 'Buat daftar belanja baru untuk keluarga'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Daftar Belanja</FormLabel>
                  <FormControl>
                    <Input placeholder="Belanja Mingguan" {...field} />
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
                {editData ? 'Update' : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
