import { useState, useCallback, useEffect, useMemo } from 'react';
import { Member, AttendanceRecord, AttendanceStatus, TEAM_NAMES, CELL_NAMES } from '@/types/attendance';

const STORAGE_KEY_MEMBERS = 'church-attendance-members';
const STORAGE_KEY_RECORDS = 'church-attendance-records';

// Generate 180 members with Korean names
const generateDefaultMembers = (): Member[] => {
  const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
  const firstNameParts1 = ['영', '민', '수', '지', '현', '승', '태', '준', '성', '도', '재', '유', '혜', '서', '윤', '예', '시', '하', '은', '소'];
  const firstNameParts2 = ['희', '수', '진', '우', '호', '민', '현', '아', '원', '준', '혁', '린', '경', '빈', '연', '정', '율', '온', '나', '은'];

  const members: Member[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 180; i++) {
    let name: string;
    do {
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const firstName1 = firstNameParts1[Math.floor(Math.random() * firstNameParts1.length)];
      const firstName2 = firstNameParts2[Math.floor(Math.random() * firstNameParts2.length)];
      name = `${lastName}${firstName1}${firstName2}`;
    } while (usedNames.has(name));
    
    usedNames.add(name);
    
    // Distribute into 12 teams (15 people per team), each team has 3 cells (5 people per cell)
    const teamIndex = Math.floor(i / 15);
    const cellIndex = Math.floor((i % 15) / 5);
    
    members.push({
      id: (i + 1).toString(),
      name,
      team: TEAM_NAMES[teamIndex],
      cell: CELL_NAMES[cellIndex],
    });
  }

  // Sort by team then by cell then by name
  return members.sort((a, b) => {
    const teamA = TEAM_NAMES.indexOf(a.team as typeof TEAM_NAMES[number]);
    const teamB = TEAM_NAMES.indexOf(b.team as typeof TEAM_NAMES[number]);
    if (teamA !== teamB) return teamA - teamB;
    
    const cellA = CELL_NAMES.indexOf(a.cell as typeof CELL_NAMES[number]);
    const cellB = CELL_NAMES.indexOf(b.cell as typeof CELL_NAMES[number]);
    if (cellA !== cellB) return cellA - cellB;
    
    return a.name.localeCompare(b.name, 'ko');
  });
};

// Migrate old data format to new format
const migrateMembers = (members: (Member & { group?: string })[]): Member[] => {
  return members.map(member => {
    // If already has team/cell, keep as is
    if (member.team && member.cell) {
      const { group, ...rest } = member as Member & { group?: string };
      return rest;
    }
    
    // If has old group format (e.g., "1팀"), migrate to team/cell
    if ('group' in member && member.group) {
      const teamNumber = parseInt(member.group.replace('팀', ''));
      if (!isNaN(teamNumber) && teamNumber >= 1 && teamNumber <= 12) {
        return {
          id: member.id,
          name: member.name,
          team: TEAM_NAMES[teamNumber - 1],
          cell: '1셀',
        };
      }
    }
    
    return {
      id: member.id,
      name: member.name,
      team: member.team,
      cell: member.cell,
    };
  });
};

export const useAttendance = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data format
      const migrated = migrateMembers(parsed);
      // If old data has less than 180 members, regenerate
      if (migrated.length < 180) {
        return generateDefaultMembers();
      }
      return migrated;
    }
    return generateDefaultMembers();
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  const addMember = useCallback((name: string, team?: string, cell?: string) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      team,
      cell,
    };
    setMembers(prev => [...prev, newMember]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setRecords(prev => prev.filter(r => r.memberId !== id));
  }, []);

  const updateMember = useCallback((id: string, name: string, team?: string, cell?: string) => {
    setMembers(prev => 
      prev.map(m => m.id === id ? { ...m, name, team, cell } : m)
    );
  }, []);

  const getAttendance = useCallback((memberId: string, week: number): AttendanceStatus => {
    const record = records.find(r => r.memberId === memberId && r.week === week);
    return record?.status ?? 'present'; // Default to present
  }, [records]);

  const setAttendance = useCallback((memberId: string, week: number, status: AttendanceStatus) => {
    setRecords(prev => {
      const existing = prev.findIndex(r => r.memberId === memberId && r.week === week);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { memberId, week, status };
        return updated;
      }
      return [...prev, { memberId, week, status }];
    });
  }, []);

  const toggleAttendance = useCallback((memberId: string, week: number) => {
    const current = getAttendance(memberId, week);
    // 2-step toggle: present -> absent -> present
    const nextStatus: AttendanceStatus = current === 'present' ? 'absent' : 'present';
    setAttendance(memberId, week, nextStatus);
  }, [getAttendance, setAttendance]);

  const getMemberStats = useCallback((memberId: string) => {
    const memberRecords = records.filter(r => r.memberId === memberId);
    const present = memberRecords.filter(r => r.status === 'present').length;
    const absent = memberRecords.filter(r => r.status === 'absent').length;
    const total = present + absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100; // Default to 100% if no records
    return { present, absent, total, rate };
  }, [records]);

  const getWeekStats = useCallback((week: number) => {
    const weekRecords = records.filter(r => r.week === week);
    const present = weekRecords.filter(r => r.status === 'present').length;
    const absent = weekRecords.filter(r => r.status === 'absent').length;
    return { present, absent, total: members.length };
  }, [records, members]);

  // Get long-term absentees (4+ consecutive weeks)
  const getLongAbsentees = useCallback((currentWeek: number, consecutiveWeeks: number = 4) => {
    return members.filter(member => {
      let count = 0;
      for (let week = currentWeek; week >= 1 && count < consecutiveWeeks; week--) {
        const status = getAttendance(member.id, week);
        if (status === 'absent') {
          count++;
        } else {
          break;
        }
      }
      return count >= consecutiveWeeks;
    }).map(member => {
      // Calculate consecutive absent weeks
      let count = 0;
      for (let week = currentWeek; week >= 1; week--) {
        const status = getAttendance(member.id, week);
        if (status === 'absent') {
          count++;
        } else {
          break;
        }
      }
      return { member, consecutiveAbsent: count };
    });
  }, [members, getAttendance]);

  // For Excel import
  const importData = useCallback((newMembers: Member[], newRecords: AttendanceRecord[]) => {
    setMembers(newMembers);
    setRecords(newRecords);
  }, []);

  return {
    members,
    records,
    addMember,
    removeMember,
    updateMember,
    getAttendance,
    setAttendance,
    toggleAttendance,
    getMemberStats,
    getWeekStats,
    getLongAbsentees,
    importData,
  };
};
