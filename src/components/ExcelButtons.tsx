import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Upload, Cloud } from 'lucide-react';
import { exportToExcel, importFromExcel, ImportResult } from '@/utils/excelUtils';
import { Member, AttendanceRecord, AttendanceStatus, WeekInfo } from '@/types/attendance';
import { toast } from 'sonner';

interface ExcelButtonsProps {
  members: Member[];
  records: AttendanceRecord[];
  weeks: WeekInfo[];
  getAttendance: (memberId: string, week: number) => AttendanceStatus;
  onImport: (members: Member[], records: AttendanceRecord[]) => void;
}

export const ExcelButtons = ({
  members,
  records,
  weeks,
  getAttendance,
  onImport,
}: ExcelButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ImportResult | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      exportToExcel(members, records, weeks, getAttendance);
      toast.success('엑셀 파일이 다운로드되었습니다');
    } catch (error) {
      toast.error('내보내기에 실패했습니다');
      console.error('Export error:', error);
    }
  };

  const handleSaveToServer = async () => {
    try {
      const dataToSave = {
        members,
        records,
      };
      
      // Copy to clipboard as JSON (alternative to server storage)
      const jsonString = JSON.stringify(dataToSave, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success('데이터가 클립보드에 복사되었습니다. (public/data.json에 저장 필요)');
    } catch (error) {
      toast.error('클립보드 복사에 실패했습니다');
      console.error('Error:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importFromExcel(file);
      setImportData(result);
      setConfirmDialogOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '파일을 읽을 수 없습니다');
      console.error('Import error:', error);
    }

    // Reset input
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData.members, importData.records);
      toast.success(`${importData.members.length}명의 교인 데이터를 불러왔습니다`);
      setImportData(null);
    }
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          내보내기
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleImportClick}>
          <Upload className="w-4 h-4" />
          가져오기
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveToServer}>
          <Cloud className="w-4 h-4" />
          서버에 저장
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>데이터 가져오기</AlertDialogTitle>
            <AlertDialogDescription>
              {importData && (
                <>
                  <span className="font-medium text-foreground">
                    {importData.members.length}명
                  </span>
                  의 교인 데이터를 발견했습니다.
                  <br />
                  기존 데이터가 모두 덮어씌워집니다. 계속하시겠습니까?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              가져오기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
