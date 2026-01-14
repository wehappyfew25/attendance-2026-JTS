import { useState, useMemo } from 'react';
import { AttendanceHeader } from '@/components/AttendanceHeader';
import { AttendanceStats } from '@/components/AttendanceStats';
import { AttendanceTable } from '@/components/AttendanceTable';
import { AttendanceLegend } from '@/components/AttendanceLegend';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { MonthTabs } from '@/components/MonthTabs';
import { LongAbsenteeList } from '@/components/LongAbsenteeList';
import { ExcelButtons } from '@/components/ExcelButtons';
import { get2026Sundays } from '@/utils/dateUtils';
import { useAttendance } from '@/hooks/useAttendance';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const weeks = useMemo(() => get2026Sundays(), []);
  const { 
    members, 
    records, 
    addMember, 
    getAttendance, 
    getLongAbsentees,
    importData 
  } = useAttendance();

  // Calculate current week based on date (for demo, use a fixed week or the last week with records)
  const currentWeek = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    if (currentYear === 2026) {
      // Find the current week for 2026
      const currentWeekInfo = weeks.find(w => w.date >= today);
      if (currentWeekInfo) {
        return Math.max(1, currentWeekInfo.week - 1);
      }
    }
    
    // Default: return the maximum week that has any records, or 52
    const weeksWithRecords = records.map(r => r.week);
    return weeksWithRecords.length > 0 ? Math.max(...weeksWithRecords) : 52;
  }, [weeks, records]);

  const longAbsentees = useMemo(() => {
    return getLongAbsentees(currentWeek, 4);
  }, [getLongAbsentees, currentWeek]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 py-6 md:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AttendanceHeader />
          <div className="flex items-center gap-3">
            <ExcelButtons
              members={members}
              records={records}
              weeks={weeks}
              getAttendance={getAttendance}
              onImport={importData}
            />
            <AddMemberDialog onAdd={addMember} />
          </div>
        </div>

        {/* Stats */}
        <AttendanceStats members={members} records={records} />

        {/* Month Filter */}
        <MonthTabs 
          selectedMonth={selectedMonth} 
          onMonthSelect={setSelectedMonth} 
        />

        {/* Legend */}
        <AttendanceLegend />

        {/* Main content: Table + Long Absentee List */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Table */}
          <AttendanceTable 
            weeks={weeks} 
            selectedMonth={selectedMonth} 
          />

          {/* Long Absentee List */}
          <div className="lg:sticky lg:top-6 self-start">
            <LongAbsenteeList absentees={longAbsentees} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          💒 2026년 교회 출석부 • 데이터는 브라우저에 자동 저장됩니다
        </div>
      </div>
    </div>
  );
};

export default Index;
