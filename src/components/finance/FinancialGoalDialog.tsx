import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialGoalDialogProps {
  goal?: any;
  trigger: React.ReactNode;
}

export const FinancialGoalDialog = ({ goal, trigger }: FinancialGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount || '0');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [icon, setIcon] = useState(goal?.icon || '');
  const [color, setColor] = useState(goal?.color || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: familyData } = useFamily();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (goal) {
        const { error } = await supabase
          .from('financial_goals')
          .update(data)
          .eq('id', goal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('financial_goals')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] });
      toast({
        title: goal ? 'Goal diupdate' : 'Goal ditambahkan',
        description: 'Tujuan keuangan berhasil disimpan',
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
    if (!goal) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setIcon('');
      setColor('');
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

    const parsedTarget = parseFloat(targetAmount as any);
    const parsedCurrent = parseFloat(currentAmount as any) || 0;

    if (isNaN(parsedTarget)) {
      toast({
        title: 'Error',
        description: 'Target jumlah harus berupa angka yang valid',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User belum terautentikasi',
        variant: 'destructive',
      });
      return;
    }

    const payload: any = {
      name,
      target_amount: parsedTarget,
      current_amount: parsedCurrent,
      deadline: deadline || null,
      icon: icon || null,
      color: color || null,
      family_id: familyData.family_id,
    };

    if (!goal) payload.created_by = user.id;

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Tujuan Keuangan' : 'Tambah Tujuan Keuangan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Goal</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Liburan, Beli Mobil, Dana Darurat, dll"
              required
            />
          </div>

          <div>
            <Label htmlFor="targetAmount">Target Jumlah</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="50000000"
              required
            />
          </div>

          <div>
            <Label htmlFor="currentAmount">Jumlah Saat Ini</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🏖️"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="color">Warna</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
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
