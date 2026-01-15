export type AttendanceStatus = 'present' | 'absent';

export interface Member {
  id: string;
  name: string;
  team?: string;  // 예: "홀리웨이브"
  cell?: string;  // 예: "1셀"
}

export interface AttendanceRecord {
  memberId: string;
  week: number;
  status: AttendanceStatus;
}

export interface WeekInfo {
  week: number;
  date: Date;
  month: number;
}

// Team names for the church
export const TEAM_NAMES = [
  '홀리웨이브', '엑소더스', '프론티어', '디사이플', '여호수아'
] as const;

export const CELL_NAMES = ['1셀', '2셀', '3셀', '4셀', '5셀', '6셀'] as const;
