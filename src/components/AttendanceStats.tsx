import { Member, AttendanceRecord } from '@/types/attendance';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface AttendanceStatsProps {
  members: Member[];
  records: AttendanceRecord[];
}

export const AttendanceStats = ({ members, records }: AttendanceStatsProps) => {
  const totalPresent = records.filter(r => r.status === 'present').length;
  const totalAbsent = records.filter(r => r.status === 'absent').length;
  const totalRecords = totalPresent + totalAbsent;
  const overallRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  const stats = [
    {
      label: '총 교인',
      value: members.length,
      suffix: '명',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: '총 출석',
      value: totalPresent,
      suffix: '회',
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: '총 결석',
      value: totalAbsent,
      suffix: '회',
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: '평균 출석률',
      value: overallRate,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold">
                  {stat.value}
                  <span className="text-sm font-normal text-muted-foreground ml-0.5">
                    {stat.suffix}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
