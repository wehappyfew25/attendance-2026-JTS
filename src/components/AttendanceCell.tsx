import { AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface AttendanceCellProps {
  status: AttendanceStatus;
  onClick: () => void;
}

export const AttendanceCell = ({ status, onClick }: AttendanceCellProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200",
        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
        status === 'present' && "bg-success text-success-foreground shadow-sm",
        status === 'absent' && "bg-destructive/20 text-destructive"
      )}
      title={status === 'present' ? '출석' : '결석'}
    >
      {status === 'present' && <Check className="w-4 h-4" />}
      {status === 'absent' && <X className="w-4 h-4" />}
    </button>
  );
};
