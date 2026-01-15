import { useMemo, useState } from 'react';
import { WeekInfo, Member, AttendanceStatus, AttendanceRecord, TEAM_NAMES, CELL_NAMES } from '@/types/attendance';
import { MemberRow } from './MemberRow';
import { EditMemberDialog } from './EditMemberDialog';
import { formatDate, MONTH_NAMES } from '@/utils/dateUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceTableProps {
  weeks: WeekInfo[];
  selectedMonth: number | null;
  members: Member[];
  records: AttendanceRecord[];
  getAttendance: (memberId: string, week: number) => AttendanceStatus;
  toggleAttendance: (memberId: string, week: number) => void;
  getMemberStats: (memberId: string) => { present: number; absent: number; total: number; rate: number };
  removeMember: (id: string) => void;
  updateMember: (id: string, name: string, team?: string, cell?: string) => void;
}

export const AttendanceTable = ({ 
  weeks, 
  selectedMonth,
  members,
  records,
  getAttendance,
  toggleAttendance,
  getMemberStats,
  removeMember,
  updateMember,
}: AttendanceTableProps) => {
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

  // Calculate attendance count per week
  const getWeekAttendanceCount = useMemo(() => {
    const weekCounts: Record<number, number> = {};
    visibleWeeks.forEach(week => {
      const presentCount = members.filter(m => getAttendance(m.id, week.week) === 'present').length;
      weekCounts[week.week] = presentCount;
    });
    return weekCounts;
  }, [visibleWeeks, members, getAttendance, records]);

  // Sort members by team, then cell, then name
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const teamA = TEAM_NAMES.indexOf(a.team as typeof TEAM_NAMES[number]);
      const teamB = TEAM_NAMES.indexOf(b.team as typeof TEAM_NAMES[number]);
      if (teamA !== teamB) return teamA - teamB;
      
      const cellA = CELL_NAMES.indexOf(a.cell as typeof CELL_NAMES[number]);
      const cellB = CELL_NAMES.indexOf(b.cell as typeof CELL_NAMES[number]);
      if (cellA !== cellB) return cellA - cellB;
      
      return a.name.localeCompare(b.name, 'ko');
    });
  }, [members]);

  // Determine if a member starts a new team or cell group
  const getMemberGroupInfo = (index: number) => {
    if (index === 0) return { isNewTeam: true, isNewCell: true };
    const prev = sortedMembers[index - 1];
    const curr = sortedMembers[index];
    const isNewTeam = prev.team !== curr.team;
    const isNewCell = isNewTeam || prev.cell !== curr.cell;
    return { isNewTeam, isNewCell };
  };

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
              
              {/* Weekly attendance count row */}
              <tr className="bg-accent/30">
                <th className="sticky left-0 z-20 bg-accent/30 border-r border-b-2 border-border px-4 py-2">
                  <span className="text-xs font-medium text-primary">출석 인원</span>
                </th>
                {monthGroups.map((group, groupIdx) => {
                  const isCollapsed = collapsedMonths.has(group.month);
                  if (isCollapsed) {
                    return (
                      <th key={`count-collapsed-${group.month}-${groupIdx}`} className="border-b-2 border-border px-1 py-2">
                        <span className="text-xs text-muted-foreground">-</span>
                      </th>
                    );
                  }
                  return group.weeks.map((week) => (
                    <th key={`count-${week.week}`} className="border-b-2 border-border px-1 py-2">
                      <span className="text-xs font-semibold text-primary">
                        {getWeekAttendanceCount[week.week] || 0}
                      </span>
                    </th>
                  ));
                })}
                <th className="sticky right-0 z-20 bg-accent/30 border-l border-b-2 border-border px-4 py-2">
                  <span className="text-xs font-medium text-primary">{members.length}명</span>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {sortedMembers.map((member, index) => {
                const { isNewTeam, isNewCell } = getMemberGroupInfo(index);
                return (
                  <MemberRow
                    key={member.id}
                    member={member}
                    weeks={visibleWeeks}
                    getAttendance={getAttendance}
                    toggleAttendance={toggleAttendance}
                    stats={getMemberStats(member.id)}
                    onRemove={() => removeMember(member.id)}
                    onEdit={() => handleEditMember(member)}
                    isNewTeam={isNewTeam}
                    isNewCell={isNewCell}
                  />
                );
              })}
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