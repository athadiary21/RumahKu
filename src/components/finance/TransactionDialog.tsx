import { useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';

interface TransactionDialogProps {
  transaction?: any;
  trigger: React.ReactNode;
}

export const TransactionDialog = ({ transaction, trigger }: TransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(transaction?.account_id || '');
  const [categoryId, setCategoryId] = useState(transaction?.budget_category_id || '');
  const [notes, setNotes] = useState(transaction?.notes || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: familyData } = useFamily();
  const { user } = useAuth();

  const { data: accounts } = useQuery({
    queryKey: ['accounts', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('family_id', familyData.family_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!familyData?.family_id,
  });

  const { data: categories } = useQuery({
    queryKey: ['budget-categories', familyData?.family_id],
    queryFn: async () => {
      if (!familyData?.family_id) return [];
      const { data, error } = await supabase
        .from('budget_categories')
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
      if (transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(data)
          .eq('id', transaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: transaction ? 'Transaksi diupdate' : 'Transaksi ditambahkan',
        description: 'Transaksi berhasil disimpan',
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    if (!transaction) {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId('');
      setCategoryId('');
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

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User tidak terautentikasi',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      type,
      amount: parseFloat(amount),
      description,
      date,
      account_id: accountId,
      budget_category_id: categoryId === 'none' ? null : categoryId || null,
      notes: notes || null,
      family_id: familyData.family_id,
      created_by: user.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipe Transaksi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Belanja bulanan, Gaji, dll"
              required
            />
          </div>

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
            <Label htmlFor="account">Akun</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.icon} {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Kategori (Opsional)</Label>
            <Select value={categoryId || 'none'} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Kategori</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
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
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
