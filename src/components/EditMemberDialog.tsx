import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Member, TEAM_NAMES, CELL_NAMES } from '@/types/attendance';

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string, team?: string, cell?: string) => void;
}

export const EditMemberDialog = ({ 
  member, 
  open, 
  onOpenChange, 
  onSave 
}: EditMemberDialogProps) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<string>('');
  const [cell, setCell] = useState<string>('');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setTeam(member.team || '');
      setCell(member.cell || '');
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && name.trim()) {
      onSave(member.id, name.trim(), team || undefined, cell || undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>교인 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">이름 *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-team">팀 (선택)</Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger>
                <SelectValue placeholder="팀을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_NAMES.map((teamName) => (
                  <SelectItem key={teamName} value={teamName}>
                    {teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cell">셀 (선택)</Label>
            <Select value={cell} onValueChange={setCell}>
              <SelectTrigger>
                <SelectValue placeholder="셀을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CELL_NAMES.map((cellName) => (
                  <SelectItem key={cellName} value={cellName}>
                    {cellName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
