import { Card, CardContent } from '@/components/ui/card';
import { Users, Crown, Shield, User } from 'lucide-react';
import { FamilyMember } from '@/hooks/useFamilyMembers';

interface FamilyStatsProps {
  members: FamilyMember[];
}

export const FamilyStats = ({ members }: FamilyStatsProps) => {
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const memberCount = members.filter((m) => m.role === 'member').length;
  const childCount = members.filter((m) => m.role === 'child').length;

  const stats = [
    {
      label: 'Total Anggota',
      value: members.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Admin',
      value: adminCount,
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Anggota',
      value: memberCount,
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Anak',
      value: childCount,
      icon: User,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
