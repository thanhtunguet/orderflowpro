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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for demo
const mockUsers = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'sales' as const,
    unit: 'Đơn vị Hà Nội',
    unitId: 'unit-1',
    status: 'active' as const,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    fullName: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'unit_manager' as const,
    unit: 'Đơn vị Hà Nội',
    unitId: 'unit-1',
    status: 'active' as const,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    fullName: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'sales' as const,
    unit: 'Đơn vị Hồ Chí Minh',
    unitId: 'unit-2',
    status: 'active' as const,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    fullName: 'Phạm Thị D',
    email: 'phamthid@example.com',
    role: 'general_manager' as const,
    unit: 'Tất cả đơn vị',
    unitId: null,
    status: 'active' as const,
    createdAt: '2023-12-01',
  },
  {
    id: '5',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'sales' as const,
    unit: 'Đơn vị Đà Nẵng',
    unitId: 'unit-3',
    status: 'inactive' as const,
    createdAt: '2024-03-15',
  },
];

const mockUnits = [
  { id: 'unit-1', name: 'Đơn vị Hà Nội', code: 'HN' },
  { id: 'unit-2', name: 'Đơn vị Hồ Chí Minh', code: 'HCM' },
  { id: 'unit-3', name: 'Đơn vị Đà Nẵng', code: 'DN' },
];

const roleLabels: Record<string, string> = {
  sales: 'Sales',
  unit_manager: 'Quản lý Đơn vị',
  general_manager: 'Quản lý Cấp cao',
};

const roleColors: Record<string, string> = {
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

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesUnit = unitFilter === 'all' || user.unitId === unitFilter;
    return matchesSearch && matchesRole && matchesUnit;
  });

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
                  Điền thông tin để tạo tài khoản người dùng mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" placeholder="Nhập họ và tên" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Nhập email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="unit_manager">Quản lý Đơn vị</SelectItem>
                      <SelectItem value="general_manager">Quản lý Cấp cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
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
                <Button onClick={() => setIsAddDialogOpen(false)}>Tạo tài khoản</Button>
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
                <p className="text-2xl font-bold text-foreground">
                  {mockUsers.filter((u) => u.role === 'sales').length}
                </p>
                <p className="text-sm text-muted-foreground">Nhân viên Sales</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockUsers.filter((u) => u.role === 'unit_manager').length}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {mockUsers.filter((u) => u.role === 'general_manager').length}
                </p>
                <p className="text-sm text-muted-foreground">Quản lý Cấp cao</p>
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
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="unit_manager">Quản lý Đơn vị</SelectItem>
              <SelectItem value="general_manager">Quản lý Cấp cao</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {mockUnits.map((unit) => (
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
                <TableHead className="hidden lg:table-cell">Trạng thái</TableHead>
                <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.fullName}</p>
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
                    {user.unit}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className={
                        user.status === 'active'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
