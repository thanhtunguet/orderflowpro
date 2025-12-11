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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { UserWithRole, useUpdateUser, useAssignManagerUnits, useUnits } from '@/hooks/useUsers';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  sales: 'Nhân viên',
  unit_manager: 'Quản lý Đơn vị',
  general_manager: 'Quản lý Chung',
};

interface UserEditDialogProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const [editingUser, setEditingUser] = useState<{
    id: string;
    full_name: string;
    role: AppRole;
    unit_id: string | null;
    managedUnitIds: string[];
  } | null>(null);

  const { data: units } = useUnits();
  const updateUser = useUpdateUser();
  const assignManagerUnits = useAssignManagerUnits();

  useEffect(() => {
    if (user) {
      setEditingUser({
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        unit_id: user.unit_id,
        managedUnitIds: user.managedUnits?.map(u => u.id) || [],
      });
    } else {
      setEditingUser(null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      // Update user profile and role
      await updateUser.mutateAsync({
        id: editingUser.id,
        full_name: editingUser.full_name,
        role: editingUser.role,
        unit_id: editingUser.unit_id,
      });

      // If general manager, update managed units
      if (editingUser.role === 'general_manager') {
        await assignManagerUnits.mutateAsync({
          userId: editingUser.id,
          unitIds: editingUser.managedUnitIds,
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const toggleManagedUnit = (unitId: string) => {
    if (!editingUser) return;
    const newIds = editingUser.managedUnitIds.includes(unitId)
      ? editingUser.managedUnitIds.filter(id => id !== unitId)
      : [...editingUser.managedUnitIds, unitId];
    setEditingUser({ ...editingUser, managedUnitIds: newIds });
  };

  const isPending = updateUser.isPending || assignManagerUnits.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và phân quyền cho người dùng
          </DialogDescription>
        </DialogHeader>
        {editingUser && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Họ và tên</Label>
              <Input
                id="edit-fullName"
                value={editingUser.full_name}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <Select
                value={editingUser.role}
                onValueChange={(value: AppRole) => setEditingUser({ ...editingUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Nhân viên</SelectItem>
                  <SelectItem value="unit_manager">Quản lý Đơn vị</SelectItem>
                  <SelectItem value="general_manager">Quản lý Chung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Unit selection for sales and unit_manager */}
            {(editingUser.role === 'sales' || editingUser.role === 'unit_manager') && (
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Đơn vị trực thuộc</Label>
                <Select
                  value={editingUser.unit_id || 'none'}
                  onValueChange={(value) => setEditingUser({
                    ...editingUser,
                    unit_id: value === 'none' ? null : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không thuộc đơn vị nào</SelectItem>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Managed units selection for general_manager */}
            {editingUser.role === 'general_manager' && (
              <div className="grid gap-2">
                <Label>Đơn vị được quản lý</Label>
                <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {units?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có đơn vị nào</p>
                  ) : (
                    units?.map((unit) => (
                      <div key={unit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`unit-${unit.id}`}
                          checked={editingUser.managedUnitIds.includes(unit.id)}
                          onCheckedChange={() => toggleManagedUnit(unit.id)}
                        />
                        <label
                          htmlFor={`unit-${unit.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {unit.name} ({unit.code})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đã chọn {editingUser.managedUnitIds.length} đơn vị
                </p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}