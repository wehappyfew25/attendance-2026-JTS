import { Check, X } from 'lucide-react';

export const AttendanceLegend = () => {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-success text-success-foreground flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
        </div>
        <span>출석</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-destructive/20 text-destructive flex items-center justify-center">
          <X className="w-3.5 h-3.5" />
        </div>
        <span>결석</span>
      </div>
      <div className="text-xs text-muted-foreground ml-auto">
        * 셀을 클릭하여 상태를 변경하세요
      </div>
    </div>
  );
};
