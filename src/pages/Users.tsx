import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  Building2,
  Shield,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsers, useUnits, useUserStats, useUpdateUser } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  sales: 'Nhân viên',
  unit_manager: 'Quản lý Đơn vị',
  general_manager: 'Quản lý Chung',
};

const roleColors: Record<AppRole, string> = {
  sales: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  unit_manager: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  general_manager: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export default function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    full_name: string;
    role: AppRole;
    unit_id: string | null;
  } | null>(null);

  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: units, isLoading: unitsLoading } = useUnits();
  const stats = useUserStats();
  const updateUser = useUpdateUser();

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesUnit = unitFilter === 'all' || user.unit_id === unitFilter;
    return matchesSearch && matchesRole && matchesUnit;
  }) || [];

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUser.mutate({
      id: editingUser.id,
      full_name: editingUser.full_name,
      role: editingUser.role,
      unit_id: editingUser.unit_id,
    }, {
      onSuccess: () => setEditingUser(null),
    });
  };

  return (
    <DashboardLayout onLogout={() => navigate('/auth')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Người dùng</h1>
            <p className="text-muted-foreground">Quản lý tài khoản và phân quyền người dùng</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>
                  Tính năng này cần được implement qua Edge Function với quyền admin.
                  Hiện tại, người dùng mới sẽ được tạo khi họ đăng ký tài khoản.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Để thêm người dùng mới, hãy mời họ đăng ký tài khoản. Sau khi đăng ký, 
                  bạn có thể cập nhật vai trò và đơn vị của họ tại đây.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UserCog className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                {usersLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.sales}</p>
                )}
                <p className="text-sm text-muted-foreground">Nhân viên</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                {usersLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.unit_manager}</p>
                )}
                <p className="text-sm text-muted-foreground">Quản lý Đơn vị</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                {usersLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.general_manager}</p>
                )}
                <p className="text-sm text-muted-foreground">Quản lý Chung</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="sales">Nhân viên</SelectItem>
              <SelectItem value="unit_manager">Quản lý Đơn vị</SelectItem>
              <SelectItem value="general_manager">Quản lý Chung</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {units?.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">Đơn vị</TableHead>
                <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {users?.length === 0 
                      ? 'Chưa có người dùng nào trong hệ thống'
                      : 'Không tìm thấy người dùng phù hợp'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.unit?.name || 'Chưa phân bổ'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => setEditingUser({
                              id: user.id,
                              full_name: user.full_name,
                              role: user.role,
                              unit_id: user.unit_id,
                            })}
                          >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
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
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Đơn vị</Label>
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
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Hủy
              </Button>
              <Button 
                onClick={handleUpdateUser} 
                disabled={updateUser.isPending}
              >
                {updateUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
