import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Crown, MoreVertical, Shield, User, UserMinus } from 'lucide-react';
import { FamilyMember } from '@/hooks/useFamilyMembers';
import { useAuth } from '@/contexts/AuthContext';

interface FamilyMemberCardProps {
  member: FamilyMember;
  isAdmin: boolean;
  onUpdateRole: (memberId: string, newRole: 'admin' | 'member' | 'child') => void;
  onRemove: (memberId: string) => void;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    icon: Crown,
    variant: 'default' as const,
    color: 'text-yellow-500',
  },
  member: {
    label: 'Anggota',
    icon: Shield,
    variant: 'secondary' as const,
    color: 'text-blue-500',
  },
  child: {
    label: 'Anak',
    icon: User,
    variant: 'outline' as const,
    color: 'text-green-500',
  },
};

export const FamilyMemberCard = ({
  member,
  isAdmin,
  onUpdateRole,
  onRemove,
}: FamilyMemberCardProps) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === member.user_id;
  const config = roleConfig[member.role];
  const RoleIcon = config.icon;

  const initials = member.profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {member.profile?.full_name || 'Pengguna'}
              {isCurrentUser && (
                <span className="text-muted-foreground ml-1">(Anda)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={config.variant} className="gap-1">
              <RoleIcon className={`h-3 w-3 ${config.color}`} />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Bergabung {new Date(member.joined_at).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {isAdmin && !isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role !== 'admin' && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                Jadikan Admin
              </DropdownMenuItem>
            )}
            {member.role !== 'member' && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                Jadikan Anggota
              </DropdownMenuItem>
            )}
            {member.role !== 'child' && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'child')}>
                <User className="h-4 w-4 mr-2 text-green-500" />
                Jadikan Anak
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onRemove(member.id)}
              className="text-destructive focus:text-destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Hapus dari Keluarga
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
