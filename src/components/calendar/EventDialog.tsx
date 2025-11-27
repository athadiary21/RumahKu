import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/contexts/AuthContext';

interface EventDialogProps {
  event?: any;
  trigger: React.ReactNode;
}

export const EventDialog = ({ event, trigger }: EventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState(event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '');
  const [endTime, setEndTime] = useState(event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '');
  const [allDay, setAllDay] = useState(event?.all_day || false);
  const [location, setLocation] = useState(event?.location || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: familyData } = useFamily();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (event) {
        const { error } = await supabase
          .from('calendar_events')
          .update(data)
          .eq('id', event.id);
        if (error) throw error;
      } else {
        const payload = {
          ...data,
          // ensure created_by is set to current user id (required by DB)
          created_by: user?.id || null,
        };

        const { error } = await supabase
          .from('calendar_events')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: event ? 'Event diupdate' : 'Event ditambahkan',
        description: 'Event berhasil disimpan',
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
    if (!event) {
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setAllDay(false);
      setLocation('');
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
      title,
      description,
      start_time: startTime,
      end_time: endTime || null,
      all_day: allDay,
      location: location || null,
      family_id: familyData.family_id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Tambah Event Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Event</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ulang tahun, Meeting, dll"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi event..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="startTime">Waktu Mulai</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="endTime">Waktu Selesai</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allDay"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <Label htmlFor="allDay">Event Sepanjang Hari</Label>
          </div>

          <div>
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokasi event..."
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
