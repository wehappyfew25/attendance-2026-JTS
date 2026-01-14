import { Member, AttendanceStatus } from '@/types/attendance';
import { WeekInfo } from '@/types/attendance';
import { AttendanceCell } from './AttendanceCell';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberRowProps {
  member: Member;
  weeks: WeekInfo[];
  getAttendance: (memberId: string, week: number) => AttendanceStatus;
  toggleAttendance: (memberId: string, week: number) => void;
  stats: { present: number; absent: number; rate: number };
  onRemove: () => void;
  onEdit: () => void;
}

export const MemberRow = ({
  member,
  weeks,
  getAttendance,
  toggleAttendance,
  stats,
  onRemove,
  onEdit,
}: MemberRowProps) => {
  const teamCellDisplay = member.team && member.cell 
    ? `${member.team} ${member.cell}` 
    : member.team || member.cell || '';

  return (
    <tr className="group hover:bg-accent/50 transition-colors">
      <td className="sticky left-0 z-10 bg-card group-hover:bg-accent/50 transition-colors border-r border-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-[160px]">
          <div className="flex-1">
            <div className="font-medium text-foreground">{member.name}</div>
            {teamCellDisplay && (
              <div className="text-xs text-muted-foreground">{teamCellDisplay}</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
      
      {weeks.map((week) => (
        <td key={week.week} className="px-1 py-2 text-center">
          <AttendanceCell
            status={getAttendance(member.id, week.week)}
            onClick={() => toggleAttendance(member.id, week.week)}
          />
        </td>
      ))}
      
      <td className="sticky right-0 z-10 bg-card group-hover:bg-accent/50 transition-colors border-l border-border px-4 py-3">
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex-1 text-sm">
            <div className="font-medium">
              {stats.present}회 / {stats.present + stats.absent}회
            </div>
            <div className={cn(
              "text-xs",
              stats.rate >= 80 ? "text-success" : 
              stats.rate >= 50 ? "text-warning" : 
              "text-destructive"
            )}>
              {stats.rate}%
            </div>
          </div>
          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                stats.rate >= 80 ? "bg-success" : 
                stats.rate >= 50 ? "bg-warning" : 
                "bg-destructive"
              )}
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};
