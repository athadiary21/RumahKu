import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const WebsiteContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; content: string }>({ title: '', content: '' });

  const { data: content, isLoading } = useQuery({
    queryKey: ['website-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { error } = await supabase
        .from('website_content')
        .update({ title, content, updated_by: user?.id })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-content'] });
      toast({ title: 'Berhasil', description: 'Konten berhasil diupdate' });
      setEditingKey(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (item: any) => {
    setEditingKey(item.key);
    setEditValues({ title: item.title, content: item.content || '' });
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, ...editValues });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website Content</h1>
        <p className="text-muted-foreground mt-2">
          Kelola teks yang ditampilkan di website
        </p>
      </div>

      <div className="grid gap-6">
        {content?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-lg">{item.key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
              <CardDescription>Key: {item.key}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingKey === item.key ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editValues.title}
                      onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editValues.content}
                      onChange={(e) => setEditValues({ ...editValues, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(item.id)} disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setEditingKey(null)}>
                      Batal
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium">Title:</p>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Content:</p>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                  <Button variant="outline" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WebsiteContent;
