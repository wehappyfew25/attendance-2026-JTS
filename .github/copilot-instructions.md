# Copilot Instructions for Church Attendance 2026

## Project Overview
A church attendance tracking system built with React/Vite that manages attendance records for ~180 members organized into teams and cells, with month-based views, Excel import/export, and analytics.

## Architecture & Data Flow

### Core State Management
- **useAttendance hook** (`src/hooks/useAttendance.ts`): Central hook managing all attendance state via localStorage
  - `members`: Array of Member objects with id, name, team, cell
  - `records`: Array of AttendanceRecord objects linking members to weekly status
  - Exports: `addMember`, `toggleAttendance`, `getAttendance`, `getMemberStats`, `removeMember`, `updateMember`, `getLongAbsentees`, `importData`
  
### Data Types
- **Member**: `{ id, name, team (TEAM_NAMES), cell (CELL_NAMES) }`
- **AttendanceRecord**: `{ memberId, week (1-52), status: 'present' | 'absent' }`
- **Teams**: 5 predefined Korean teams (홀리웨이브, 엑소더스, 프론티어, 디사이플, 여호수아)
- **Cells**: 6 cells per team (1셀-6셀)

### Component Hierarchy
```
Index (page, state coordinator)
├── AttendanceHeader (controls, date info)
├── MonthTabs (month selector)
├── AttendanceTable (main display, grouped by month)
│   └── MemberRow (individual attendance cells, deletable)
├── AttendanceStats (summary metrics)
├── LongAbsenteeList (members absent 4+ weeks)
├── ExcelButtons (import/export)
└── AddMemberDialog
```

## Key Patterns & Conventions

### Data Persistence
- All state persisted to localStorage with keys: `church-attendance-members`, `church-attendance-records`
- Data migration logic in useAttendance handles legacy `group` format → `team`/`cell` format
- 180 default members auto-generated if no saved data exists

### Date Handling
- **2026-specific**: Project assumes year 2026 (see `dateUtils.get2026Sundays()`, `dateUtils.MONTH_NAMES`)
- **Weekly tracking**: Weeks numbered 1-52, tied to Sundays
- Months grouped 0-11 (Jan=0) from `WeekInfo.month`

### Excel Operations
- **Export**: Creates XLSX with headers `[이름, 팀, 셀, 1주, 2주, ...]`, attendance as 'O'/'X'
- **Import**: Parses XLSX, maps columns by header name (이름, 팀, 셀, then weeks 1+)
- Helper: `excelUtils.ts` handles all XLSX operations (via `xlsx` library)

### UI Components
- Heavy use of shadcn/ui components (via `src/components/ui/`)
- Dialog-based editing (AddMemberDialog, EditMemberDialog) for member management
- Collapsible month sections in AttendanceTable for large datasets
- Toast notifications via Sonner for feedback

## Development Workflow

### Build & Run
```bash
npm run dev      # Start Vite dev server on port 8080
npm run build    # Production build
npm run lint     # ESLint check
```

### When Adding Features
1. **New member fields**: Update `Member` type in `src/types/attendance.ts`, migrate in `useAttendance.ts`
2. **Attendance calculations**: Add to `getMemberStats` or create utils in `src/utils/`
3. **Monthly data views**: Leverage `groupWeeksByMonth()` in dateUtils; filter via `selectedMonth`
4. **Excel template changes**: Edit `excelUtils.ts` export/import logic, consider backward compatibility

### File Organization
- `src/types/` - Data type definitions (single attendance.ts file)
- `src/hooks/` - State management (useAttendance is canonical)
- `src/utils/` - Pure functions (dateUtils, excelUtils)
- `src/components/` - UI components; ui/ contains shadcn copies
- `src/pages/` - Route pages (Index.tsx is main app)

## Common Tasks

**Track a new member's attendance**: `toggleAttendance(memberId, weekNumber)` updates or creates record

**Bulk import members**: `importData(members, records)` merges into existing state via importFromExcel utility

**Filter by team/cell**: MemberRow component renders all teams/cells; filter in parent via `members.filter(m => m.team === team)`

**Statistics**: `getMemberStats(memberId)` returns `{present, absent, total, rate}`; AttendanceStats component displays aggregates

## External Dependencies
- **@tanstack/react-query**: Installed but not actively used (QueryClient set up in App.tsx)
- **xlsx**: Excel read/write operations
- **react-router-dom**: Single route setup (/ → Index, * → NotFound)
- **@radix-ui**: Headless component primitives; shadcn wraps with Tailwind
- **tailwind.config.ts**: Standard Tailwind + shadcn theme

## Notes for Contributors
- Korean language throughout (member names, team/cell labels, month names) - preserve in UI
- Component testing happens implicitly via localStorage persistence
- No formal tests; validate via dev server and Excel roundtrip
