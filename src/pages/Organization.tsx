import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  Briefcase,
  User,
  Loader2,
  FolderTree,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useOrganizationTree, 
  useOrganizationStats, 
  useCreateUnit, 
  useUpdateUnit, 
  useDeleteUnit,
  UnitWithHierarchy,
} from '@/hooks/useOrganization';
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

interface UnitCardProps {
  unit: UnitWithHierarchy;
  isExpanded: boolean;
  onToggle: () => void;
  allUnits: UnitWithHierarchy[];
  onEdit: (unit: UnitWithHierarchy) => void;
  onDelete: (unitId: string) => void;
  onAddChild: (parentId: string) => void;
}

function UnitCard({ unit, isExpanded, onToggle, allUnits, onEdit, onDelete, onAddChild }: UnitCardProps) {
  const salesMembers = unit.members.filter(m => m.role === 'sales');
  const expandedUnits = useState<Set<string>>(new Set())[0];

  return (
    <div className="space-y-2">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Unit Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{unit.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {unit.code}
                </Badge>
                {unit.children.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unit.children.length} đơn vị con
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {unit.members.length} thành viên
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => onEdit(unit)}>
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa đơn vị
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onAddChild(unit.id)}>
                  <FolderTree className="h-4 w-4" />
                  Thêm đơn vị con
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => onDelete(unit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa đơn vị
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-border">
            {/* Unit Manager */}
            {unit.manager && (
              <div className="p-4 bg-amber-500/5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-semibold">
                      {unit.manager.full_name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Briefcase className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{unit.manager.full_name}</p>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                        Quản lý Đơn vị
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{unit.manager.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Team */}
            {salesMembers.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Nhân viên ({salesMembers.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {salesMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-medium text-sm">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!unit.manager && salesMembers.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Chưa có thành viên nào trong đơn vị này
              </div>
            )}
          </div>
        )}
      </div>

      {/* Child Units */}
      {isExpanded && unit.children.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-border space-y-2">
          {unit.children.map((child) => (
            <UnitCardRecursive
              key={child.id}
              unit={child}
              allUnits={allUnits}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UnitCardRecursive({ 
  unit, 
  allUnits, 
  onEdit, 
  onDelete, 
  onAddChild 
}: Omit<UnitCardProps, 'isExpanded' | 'onToggle'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <UnitCard
      unit={unit}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      allUnits={allUnits}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddChild={onAddChild}
    />
  );
}

export default function Organization() {
  const navigate = useNavigate();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', code: '', parent_id: '' });
  const [editingUnit, setEditingUnit] = useState<UnitWithHierarchy | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);

  const { data: orgData, isLoading } = useOrganizationTree();
  const stats = useOrganizationStats();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleCreateUnit = () => {
    createUnit.mutate({
      name: newUnit.name,
      code: newUnit.code,
      parent_id: newUnit.parent_id || null,
    }, {
      onSuccess: () => {
        setIsAddUnitDialogOpen(false);
        setNewUnit({ name: '', code: '', parent_id: '' });
      },
    });
  };

  const handleUpdateUnit = () => {
    if (!editingUnit) return;
    updateUnit.mutate({
      id: editingUnit.id,
      name: editingUnit.name,
      code: editingUnit.code,
    }, {
      onSuccess: () => setEditingUnit(null),
    });
  };

  const handleDeleteUnit = () => {
    if (!deletingUnitId) return;
    deleteUnit.mutate(deletingUnitId, {
      onSuccess: () => setDeletingUnitId(null),
    });
  };

  const handleAddChild = (parentId: string) => {
    setNewUnit({ name: '', code: '', parent_id: parentId });
    setIsAddUnitDialogOpen(true);
  };

  // Flatten all units for parent selection
  const flattenUnits = (units: UnitWithHierarchy[]): { id: string; name: string; level: number }[] => {
    return units.flatMap(u => [
      { id: u.id, name: u.name, level: u.level },
      ...flattenUnits(u.children),
    ]);
  };

  const allFlatUnits = orgData ? flattenUnits(orgData.units) : [];

  return (
    <DashboardLayout onLogout={() => navigate('/auth')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cây tổ chức</h1>
            <p className="text-muted-foreground">Quản lý cấu trúc tổ chức đa cấp độ</p>
          </div>
          <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setNewUnit({ name: '', code: '', parent_id: '' })}>
                <Plus className="h-4 w-4" />
                Thêm đơn vị
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {newUnit.parent_id ? 'Thêm đơn vị con' : 'Thêm đơn vị mới'}
                </DialogTitle>
                <DialogDescription>
                  Tạo đơn vị mới trong cấu trúc tổ chức
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="unitName">Tên đơn vị</Label>
                  <Input 
                    id="unitName" 
                    placeholder="VD: Đơn vị Hải Phòng"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitCode">Mã đơn vị</Label>
                  <Input 
                    id="unitCode" 
                    placeholder="VD: HP"
                    value={newUnit.code}
                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parentUnit">Đơn vị cha (tùy chọn)</Label>
                  <Select 
                    value={newUnit.parent_id || 'none'} 
                    onValueChange={(value) => setNewUnit({ ...newUnit, parent_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có (đơn vị gốc)</SelectItem>
                      {allFlatUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {'—'.repeat(unit.level)} {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUnitDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateUnit}
                  disabled={!newUnit.name || !newUnit.code || createUnit.isPending}
                >
                  {createUnit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Tạo đơn vị
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Crown className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.generalManagers}</p>
                )}
                <p className="text-sm text-muted-foreground">Quản lý Chung</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.units}</p>
                )}
                <p className="text-sm text-muted-foreground">Đơn vị</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Briefcase className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.unitManagers}</p>
                )}
                <p className="text-sm text-muted-foreground">Quản lý Đơn vị</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                )}
                <p className="text-sm text-muted-foreground">Tổng nhân sự</p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Tree */}
        <div className="space-y-4">
          {/* Level 1: General Managers */}
          {orgData?.generalManagers && orgData.generalManagers.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <Crown className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quản lý Chung</h2>
                  <p className="text-sm text-muted-foreground">Quản lý toàn bộ hệ thống</p>
                </div>
              </div>
              <div className="ml-4 pl-4 border-l-2 border-emerald-500/30 space-y-2">
                {orgData.generalManagers.map((gm) => (
                  <div
                    key={gm.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                          {gm.full_name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{gm.full_name}</p>
                        <p className="text-sm text-muted-foreground">{gm.email}</p>
                      </div>
                    </div>
                    {gm.managedUnitIds.length > 0 && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Quản lý {gm.managedUnitIds.length} đơn vị
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Tree */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Các đơn vị</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : orgData?.units.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có đơn vị nào được tạo</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddUnitDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm đơn vị đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {orgData?.units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isExpanded={expandedUnits.has(unit.id)}
                    onToggle={() => toggleUnit(unit.id)}
                    allUnits={orgData.units}
                    onEdit={setEditingUnit}
                    onDelete={setDeletingUnitId}
                    onAddChild={handleAddChild}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Unit Dialog */}
        <Dialog open={!!editingUnit} onOpenChange={(open) => !open && setEditingUnit(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đơn vị</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin đơn vị
              </DialogDescription>
            </DialogHeader>
            {editingUnit && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-unitName">Tên đơn vị</Label>
                  <Input 
                    id="edit-unitName" 
                    value={editingUnit.name}
                    onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unitCode">Mã đơn vị</Label>
                  <Input 
                    id="edit-unitCode" 
                    value={editingUnit.code}
                    onChange={(e) => setEditingUnit({ ...editingUnit, code: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUnit(null)}>
                Hủy
              </Button>
              <Button 
                onClick={handleUpdateUnit}
                disabled={updateUnit.isPending}
              >
                {updateUnit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingUnitId} onOpenChange={(open) => !open && setDeletingUnitId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa đơn vị</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa đơn vị này? Hành động này không thể hoàn tác.
                Các đơn vị con sẽ trở thành đơn vị gốc.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUnit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUnit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Xóa đơn vị
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
