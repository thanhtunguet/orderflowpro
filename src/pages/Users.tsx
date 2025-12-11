import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsers, useUnits, useUserStats, useCreateUser, useDeleteUser, UserWithRole } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';
import { UserEditDialog } from '@/components/users/UserEditDialog';

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
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'sales' as AppRole,
    unit_id: null as string | null,
  });

  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: units } = useUnits();
  const stats = useUserStats();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesUnit = unitFilter === 'all' || user.unit_id === unitFilter;
    return matchesSearch && matchesRole && matchesUnit;
  }) || [];

  const handleCreateUser = () => {
    createUser.mutate(newUser, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'sales', unit_id: null });
      },
    });
  };

  const handleDeleteUser = () => {
    if (!deletingUserId) return;
    deleteUser.mutate(deletingUserId, {
      onSuccess: () => setDeletingUserId(null),
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
                  Tạo tài khoản mới cho người dùng trong hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="email@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Mật khẩu</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-fullname">Họ và tên</Label>
                  <Input
                    id="new-fullname"
                    placeholder="Nguyễn Văn A"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-role">Vai trò</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: AppRole) => setNewUser({ ...newUser, role: value })}
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
                  <Label htmlFor="new-unit">Đơn vị</Label>
                  <Select
                    value={newUser.unit_id || 'none'}
                    onValueChange={(value) => setNewUser({ ...newUser, unit_id: value === 'none' ? null : value })}
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={!newUser.email || !newUser.password || !newUser.full_name || createUser.isPending}
                >
                  {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Tạo người dùng
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
                <TableHead className="hidden md:table-cell">Đơn vị / Quản lý</TableHead>
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
                    <TableCell className="hidden md:table-cell">
                      {user.role === 'general_manager' ? (
                        <div className="flex flex-wrap gap-1">
                          {user.managedUnits && user.managedUnits.length > 0 ? (
                            user.managedUnits.slice(0, 2).map(unit => (
                              <Badge key={unit.id} variant="secondary" className="text-xs">
                                {unit.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Chưa gán đơn vị</span>
                          )}
                          {user.managedUnits && user.managedUnits.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.managedUnits.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {user.unit?.name || 'Chưa phân bổ'}
                        </span>
                      )}
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
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeletingUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa người dùng
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
        <UserEditDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Xóa người dùng
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}