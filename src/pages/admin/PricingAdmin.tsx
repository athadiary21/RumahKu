import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Loader2, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  is_popular: boolean;
  published: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

const PricingAdmin = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price_monthly: 0,
    price_yearly: 0,
    features: '',
    is_popular: false,
    published: true,
    display_order: 0,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['pricing-plans-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_tiers_admin')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PricingPlan[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('pricing_tiers_admin')
        .insert([{
          ...data,
          features: JSON.parse(data.features),
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans-admin'] });
      toast({ title: 'Berhasil', description: 'Paket harga berhasil ditambahkan' });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('pricing_tiers_admin')
        .update({
          ...data,
          features: JSON.parse(data.features),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans-admin'] });
      toast({ title: 'Berhasil', description: 'Paket harga berhasil diupdate' });
      setDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_tiers_admin')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans-admin'] });
      toast({ title: 'Berhasil', description: 'Paket harga berhasil dihapus' });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      features: JSON.stringify(plan.features, null, 2),
      is_popular: plan.is_popular,
      published: plan.published,
      display_order: plan.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    // Validate features JSON
    try {
      JSON.parse(formData.features);
    } catch (e) {
      toast({ title: 'Error', description: 'Features harus berupa JSON array yang valid', variant: 'destructive' });
      return;
    }

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_monthly: 0,
      price_yearly: 0,
      features: '[]',
      is_popular: false,
      published: true,
      display_order: 0,
    });
    setEditingPlan(null);
  };

  const getTierBadge = (name: string) => {
    return <Badge>{name}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Kelola paket harga dan fitur
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Paket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paket</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paket Aktif</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.published).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Harga Tertinggi</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {Math.max(...plans.map(p => p.price_monthly), 0).toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.published ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.is_popular && <Badge className="bg-yellow-500">Popular</Badge>}
              </div>
              <CardDescription>
                <div className="text-2xl font-bold mt-2">
                  Rp {plan.price_monthly.toLocaleString('id-ID')}
                  <span className="text-sm font-normal text-muted-foreground">/bulan</span>
                </div>
                <div className="text-lg mt-1">
                  Rp {plan.price_yearly.toLocaleString('id-ID')}
                  <span className="text-sm font-normal text-muted-foreground">/tahun</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Fitur:</p>
                <ul className="text-sm space-y-1">
                  {Array.isArray(plan.features) && plan.features.slice(0, 3).map((feature: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {Array.isArray(plan.features) && plan.features.length > 3 && (
                    <li className="text-muted-foreground">
                      +{plan.features.length - 3} fitur lainnya
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Order: {plan.display_order}</Badge>
                {plan.published ? (
                  <Badge variant="default" className="bg-green-500">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Paket Harga' : 'Tambah Paket Harga'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update informasi paket harga' : 'Buat paket harga baru'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Paket</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Family Plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Bulanan (Rp)</Label>
                <Input
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                  placeholder="49000"
                />
              </div>

              <div className="space-y-2">
                <Label>Harga Tahunan (Rp)</Label>
                <Input
                  type="number"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                  placeholder="490000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features (JSON Array)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: JSON array of strings. Contoh: ["Fitur 1", "Fitur 2"]
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label>Popular</Label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label>Published</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPlan ? 'Update' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Paket Harga?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Paket harga akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => planToDelete && deleteMutation.mutate(planToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingAdmin;
