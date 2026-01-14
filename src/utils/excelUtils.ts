import * as XLSX from 'xlsx';
import { Member, AttendanceRecord, AttendanceStatus, WeekInfo, TEAM_NAMES, CELL_NAMES } from '@/types/attendance';

export const exportToExcel = (
  members: Member[],
  records: AttendanceRecord[],
  weeks: WeekInfo[],
  getAttendance: (memberId: string, week: number) => AttendanceStatus
) => {
  // Create header row
  const headers = ['이름', '팀', '셀', ...weeks.map(w => `${w.week}주`)];
  
  // Create data rows
  const data = members.map(member => {
    const row: (string | undefined)[] = [
      member.name,
      member.team || '',
      member.cell || '',
    ];
    
    weeks.forEach(week => {
      const status = getAttendance(member.id, week.week);
      row.push(status === 'present' ? 'O' : 'X');
    });
    
    return row;
  });
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  const colWidths = [
    { wch: 10 }, // 이름
    { wch: 10 }, // 팀
    { wch: 6 },  // 셀
    ...weeks.map(() => ({ wch: 5 })), // 주차
  ];
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '출석부');
  
  // Download
  const now = new Date();
  const filename = `출석부_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export interface ImportResult {
  members: Member[];
  records: AttendanceRecord[];
}

export const importFromExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('데이터가 없습니다');
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as string[][];
        
        // Find column indices
        const nameIdx = headers.findIndex(h => h === '이름');
        const teamIdx = headers.findIndex(h => h === '팀');
        const cellIdx = headers.findIndex(h => h === '셀');
        
        if (nameIdx === -1) {
          throw new Error('이름 열을 찾을 수 없습니다');
        }
        
        // Find week columns (format: "N주")
        const weekColumns: { idx: number; week: number }[] = [];
        headers.forEach((h, idx) => {
          const match = String(h).match(/^(\d+)주$/);
          if (match) {
            weekColumns.push({ idx, week: parseInt(match[1]) });
          }
        });
        
        // Parse members and records
        const members: Member[] = [];
        const records: AttendanceRecord[] = [];
        
        rows.forEach((row, rowIdx) => {
          const name = row[nameIdx]?.trim();
          if (!name) return;
          
          const memberId = (rowIdx + 1).toString();
          let team = teamIdx !== -1 ? row[teamIdx]?.trim() : undefined;
          let cell = cellIdx !== -1 ? row[cellIdx]?.trim() : undefined;
          
          // Validate team and cell
          if (team && !TEAM_NAMES.includes(team as typeof TEAM_NAMES[number])) {
            team = undefined;
          }
          if (cell && !CELL_NAMES.includes(cell as typeof CELL_NAMES[number])) {
            cell = undefined;
          }
          
          members.push({
            id: memberId,
            name,
            team,
            cell,
          });
          
          // Parse attendance for each week
          weekColumns.forEach(({ idx, week }) => {
            const value = String(row[idx] || '').trim().toUpperCase();
            if (value === 'O' || value === 'X') {
              records.push({
                memberId,
                week,
                status: value === 'O' ? 'present' : 'absent',
              });
            }
          });
        });
        
        resolve({ members, records });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
