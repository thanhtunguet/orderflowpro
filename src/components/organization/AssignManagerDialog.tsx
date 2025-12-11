import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, User } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UnitWithHierarchy, useAssignUnitManager } from '@/hooks/useOrganization';

interface AssignManagerDialogProps {
  unit: UnitWithHierarchy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignManagerDialog({ unit, open, onOpenChange }: AssignManagerDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('none');
  const { data: users } = useUsers();
  const assignManager = useAssignUnitManager();

  // Filter users who can be unit managers (either already unit_manager or sales)
  const eligibleUsers = users?.filter(
    u => u.role === 'sales' || u.role === 'unit_manager'
  ) || [];

  useEffect(() => {
    if (unit?.manager) {
      setSelectedUserId(unit.manager.id);
    } else {
      setSelectedUserId('none');
    }
  }, [unit]);

  const handleSave = async () => {
    if (!unit) return;

    try {
      await assignManager.mutateAsync({
        unitId: unit.id,
        userId: selectedUserId === 'none' ? null : selectedUserId,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gán Quản lý Đơn vị</DialogTitle>
          <DialogDescription>
            Chọn người sẽ quản lý đơn vị "{unit?.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Chọn Quản lý</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người quản lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Không có quản lý</span>
                </SelectItem>
                {eligibleUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{user.full_name}</span>
                      {user.unit_id === unit?.id && user.role === 'unit_manager' && (
                        <span className="text-xs text-muted-foreground">(Hiện tại)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Người được chọn sẽ được nâng cấp thành Quản lý Đơn vị
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={assignManager.isPending}>
            {assignManager.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
