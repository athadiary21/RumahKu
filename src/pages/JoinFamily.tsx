import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAcceptInvitation } from '@/hooks/useFamilyInvitations';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, CheckCircle, XCircle, LogIn } from 'lucide-react';

interface InvitationInfo {
  id: string;
  family_id: string;
  role: string;
  expires_at: string;
  family_groups: {
    name: string;
  };
}

const JoinFamily = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const acceptInvitation = useAcceptInvitation();
  
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Token undangan tidak valid');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('family_invitations')
          .select('id, family_id, role, expires_at, family_groups(name)')
          .eq('token', token)
          .eq('status', 'pending')
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Undangan tidak ditemukan atau sudah tidak berlaku');
          setLoading(false);
          return;
        }

        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setError('Undangan sudah kedaluwarsa');
          setLoading(false);
          return;
        }

        setInvitation(data as unknown as InvitationInfo);
      } catch (err) {
        setError('Gagal memuat undangan');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    
    try {
      const result = await acceptInvitation.mutateAsync(token);
      if (result.success) {
        navigate('/dashboard/family');
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
    navigate('/auth');
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    member: 'Anggota',
    child: 'Anak',
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memuat undangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Undangan Tidak Valid</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Undangan Keluarga</CardTitle>
          <CardDescription>
            Anda diundang untuk bergabung dengan keluarga
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {invitation.family_groups?.name || 'Keluarga'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sebagai: <span className="font-medium">{roleLabels[invitation.role] || invitation.role}</span>
            </p>
          </div>

          {user ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Anda masuk sebagai <span className="font-medium">{user.email}</span>
              </p>
              <Button 
                onClick={handleAccept} 
                className="w-full"
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terima Undangan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Silakan masuk atau daftar untuk menerima undangan ini
              </p>
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Masuk / Daftar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinFamily;
