import { WeekInfo } from '@/types/attendance';

export const get2026Sundays = (): WeekInfo[] => {
  const sundays: WeekInfo[] = [];
  const year = 2026;
  
  // Start from January 1, 2026 and find first Sunday
  let date = new Date(year, 0, 1);
  
  // Find first Sunday
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  
  let week = 1;
  while (date.getFullYear() === year && week <= 52) {
    sundays.push({
      week,
      date: new Date(date),
      month: date.getMonth(),
    });
    date.setDate(date.getDate() + 7);
    week++;
  }
  
  return sundays;
};

export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export const groupWeeksByMonth = (weeks: WeekInfo[]): Map<number, WeekInfo[]> => {
  const grouped = new Map<number, WeekInfo[]>();
  
  weeks.forEach(week => {
    if (!grouped.has(week.month)) {
      grouped.set(week.month, []);
    }
    grouped.get(week.month)!.push(week);
  });
  
  return grouped;
};
