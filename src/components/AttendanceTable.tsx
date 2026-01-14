import { useMemo, useState } from 'react';
import { WeekInfo, Member } from '@/types/attendance';
import { useAttendance } from '@/hooks/useAttendance';
import { MemberRow } from './MemberRow';
import { EditMemberDialog } from './EditMemberDialog';
import { formatDate, MONTH_NAMES } from '@/utils/dateUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceTableProps {
  weeks: WeekInfo[];
  selectedMonth: number | null;
}

export const AttendanceTable = ({ weeks, selectedMonth }: AttendanceTableProps) => {
  const {
    members,
    getAttendance,
    toggleAttendance,
    getMemberStats,
    removeMember,
    updateMember,
  } = useAttendance();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<number>>(new Set());

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  const handleSaveMember = (id: string, name: string, team?: string, cell?: string) => {
    updateMember(id, name, team, cell);
  };

  const toggleMonth = (month: number) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const filteredWeeks = useMemo(() => {
    if (selectedMonth === null) return weeks;
    return weeks.filter(w => w.month === selectedMonth);
  }, [weeks, selectedMonth]);

  // Group weeks by month for header and collapsing
  const monthGroups = useMemo(() => {
    const groups: { month: number; weeks: WeekInfo[] }[] = [];
    let currentMonth = -1;
    
    filteredWeeks.forEach((week) => {
      if (week.month !== currentMonth) {
        groups.push({ month: week.month, weeks: [week] });
        currentMonth = week.month;
      } else {
        groups[groups.length - 1].weeks.push(week);
      }
    });
    
    return groups;
  }, [filteredWeeks]);

  // Get visible weeks based on collapsed months
  const visibleWeeks = useMemo(() => {
    return filteredWeeks.filter(week => !collapsedMonths.has(week.month));
  }, [filteredWeeks, collapsedMonths]);

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">등록된 교인이 없습니다</p>
          <p className="text-sm mt-1">위의 '교인 추가' 버튼을 눌러 교인을 등록해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative border border-border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse">
            <thead>
              {/* Month header row */}
              <tr className="bg-primary/5">
                <th className="sticky left-0 z-20 bg-primary/5 border-r border-b border-border px-4 py-2">
                  <span className="text-sm font-semibold text-primary">이름</span>
                </th>
                {monthGroups.map((group, idx) => {
                  const isCollapsed = collapsedMonths.has(group.month);
                  return (
                    <th
                      key={`${group.month}-${idx}`}
                      colSpan={isCollapsed ? 1 : group.weeks.length}
                      className="border-b border-border px-2 py-2 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => toggleMonth(group.month)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-sm font-semibold text-primary">
                          {MONTH_NAMES[group.month]}
                        </span>
                        {isCollapsed && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({group.weeks.length}주)
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="sticky right-0 z-20 bg-primary/5 border-l border-b border-border px-4 py-2">
                  <span className="text-sm font-semibold text-primary">통계</span>
                </th>
              </tr>
              
              {/* Week number row */}
              <tr className="bg-muted/50">
                <th className="sticky left-0 z-20 bg-muted/50 border-r border-b border-border px-4 py-2">
                  <span className="text-xs text-muted-foreground">팀/셀</span>
                </th>
                {monthGroups.map((group, groupIdx) => {
                  const isCollapsed = collapsedMonths.has(group.month);
                  if (isCollapsed) {
                    return (
                      <th key={`collapsed-${group.month}-${groupIdx}`} className="border-b border-border px-1 py-2">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs text-muted-foreground">접힘</span>
                        </div>
                      </th>
                    );
                  }
                  return group.weeks.map((week) => (
                    <th key={week.week} className="border-b border-border px-1 py-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                          {week.week}주
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(week.date)}
                        </span>
                      </div>
                    </th>
                  ));
                })}
                <th className="sticky right-0 z-20 bg-muted/50 border-l border-b border-border px-4 py-2">
                  <span className="text-xs text-muted-foreground">출석률</span>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  weeks={visibleWeeks}
                  getAttendance={getAttendance}
                  toggleAttendance={toggleAttendance}
                  stats={getMemberStats(member.id)}
                  onRemove={() => removeMember(member.id)}
                  onEdit={() => handleEditMember(member)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <EditMemberDialog
        member={editingMember}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveMember}
      />
    </>
  );
};
