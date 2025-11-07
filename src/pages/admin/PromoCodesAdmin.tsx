import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tag, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';

const PromoCodesAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [applicableTiers, setApplicableTiers] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['admin-promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createPromoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('promo_codes').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast({ title: 'Berhasil', description: 'Kode promo berhasil dibuat' });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePromoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast({ title: 'Berhasil', description: 'Kode promo berhasil diupdate' });
      resetForm();
      setDialogOpen(false);
    },
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast({ title: 'Berhasil', description: 'Kode promo berhasil dihapus' });
    },
  });

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMaxUses('');
    setApplicableTiers([]);
    setValidUntil('');
    setIsActive(true);
    setEditingPromo(null);
  };

  const handleEdit = (promo: any) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDescription(promo.description || '');
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value.toString());
    setMaxUses(promo.max_uses?.toString() || '');
    setApplicableTiers(promo.applicable_tiers || []);
    setValidUntil(promo.valid_until ? format(new Date(promo.valid_until), "yyyy-MM-dd'T'HH:mm") : '');
    setIsActive(promo.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const promoData = {
      code: code.toUpperCase(),
      description,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: maxUses ? parseInt(maxUses) : null,
      applicable_tiers: applicableTiers.length > 0 ? applicableTiers : null,
      valid_until: validUntil || null,
      is_active: isActive,
    };

    if (editingPromo) {
      updatePromoMutation.mutate({ id: editingPromo.id, data: promoData });
    } else {
      createPromoMutation.mutate(promoData);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Kode promo berhasil disalin' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Promo Codes Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola kode promo dan diskon
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Kode Promo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? 'Edit Kode Promo' : 'Buat Kode Promo Baru'}
              </DialogTitle>
              <DialogDescription>
                Buat kode promo untuk memberikan diskon kepada pelanggan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kode Promo *</Label>
                  <Input
                    placeholder="WELCOME50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Diskon *</Label>
                  <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Diskon 50% untuk pelanggan baru"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nilai Diskon *</Label>
                  <Input
                    type="number"
                    placeholder={discountType === 'percentage' ? '50' : '10000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {discountType === 'percentage' ? 'Persentase (0-100)' : 'Jumlah dalam Rupiah'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Maksimal Penggunaan</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk unlimited
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Berlaku Untuk Tier</Label>
                <div className="flex gap-2">
                  {['family', 'premium'].map((tier) => (
                    <Button
                      key={tier}
                      type="button"
                      variant={applicableTiers.includes(tier) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setApplicableTiers((prev) =>
                          prev.includes(tier)
                            ? prev.filter((t) => t !== tier)
                            : [...prev, tier]
                        );
                      }}
                    >
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kosongkan untuk berlaku di semua tier
                </p>
              </div>

              <div className="space-y-2">
                <Label>Berlaku Hingga</Label>
                <Input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan untuk tidak ada batas waktu
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label>Aktif</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!code || !discountValue || createPromoMutation.isPending || updatePromoMutation.isPending}
              >
                {editingPromo ? 'Update' : 'Buat'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kode Promo ({promoCodes.length})</CardTitle>
          <CardDescription>Semua kode promo yang tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Diskon</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Berlaku Hingga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo: any) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{promo.code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}%`
                        : `Rp ${promo.discount_value.toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell>
                      {promo.current_uses} / {promo.max_uses || '∞'}
                    </TableCell>
                    <TableCell>
                      {promo.applicable_tiers ? (
                        <div className="flex gap-1">
                          {promo.applicable_tiers.map((tier: string) => (
                            <Badge key={tier} variant="outline" className="text-xs">
                              {tier}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">All</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {promo.valid_until
                        ? format(new Date(promo.valid_until), 'dd MMM yyyy')
                        : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      <Badge className={promo.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePromoMutation.mutate(promo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodesAdmin;
