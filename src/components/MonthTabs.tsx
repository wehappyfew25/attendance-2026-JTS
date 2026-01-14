import { MONTH_NAMES } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface MonthTabsProps {
  selectedMonth: number | null;
  onMonthSelect: (month: number | null) => void;
}

export const MonthTabs = ({ selectedMonth, onMonthSelect }: MonthTabsProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-thin">
      <button
        onClick={() => onMonthSelect(null)}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
          selectedMonth === null
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background"
        )}
      >
        전체
      </button>
      {MONTH_NAMES.map((name, index) => (
        <button
          key={index}
          onClick={() => onMonthSelect(index)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
            selectedMonth === index
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
