import { Member } from '@/types/attendance';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AbsenteeInfo {
  member: Member;
  consecutiveAbsent: number;
}

interface LongAbsenteeListProps {
  absentees: AbsenteeInfo[];
}

export const LongAbsenteeList = ({ absentees }: LongAbsenteeListProps) => {
  if (absentees.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">장기결석자 명단</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          연속 4주 이상 결석자가 없습니다 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="font-semibold text-foreground">장기결석자 명단</h3>
        <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
          {absentees.length}명
        </span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {absentees.map(({ member, consecutiveAbsent }) => {
          const teamCellDisplay = member.team && member.cell 
            ? `${member.team} ${member.cell}` 
            : member.team || member.cell || '';
          
          return (
            <div
              key={member.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                "bg-destructive/5 border border-destructive/20",
                "hover:bg-destructive/10 transition-colors"
              )}
            >
              <div>
                <div className="font-medium text-foreground">{member.name}</div>
                {teamCellDisplay && (
                  <div className="text-xs text-muted-foreground">{teamCellDisplay}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-destructive">
                  {consecutiveAbsent}주 연속
                </div>
                <div className="text-xs text-muted-foreground">결석</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
