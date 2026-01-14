import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { UserPlus } from 'lucide-react';
import { TEAM_NAMES, CELL_NAMES } from '@/types/attendance';

interface AddMemberDialogProps {
  onAdd: (name: string, team?: string, cell?: string) => void;
}

export const AddMemberDialog = ({ onAdd }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [team, setTeam] = useState<string>('');
  const [cell, setCell] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), team || undefined, cell || undefined);
      setName('');
      setTeam('');
      setCell('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          교인 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 교인 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">팀 (선택)</Label>
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
            <Label htmlFor="cell">셀 (선택)</Label>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
