import { BookOpen } from 'lucide-react';

export const AttendanceHeader = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary rounded-xl shadow-lg">
        <BookOpen className="w-8 h-8 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          2026년 출석부
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          교회 주일 출석 기록 관리
        </p>
      </div>
    </div>
  );
};
