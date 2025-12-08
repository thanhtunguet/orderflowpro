import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  Briefcase,
  User,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock organization data
const organizationData = {
  generalManagers: [
    {
      id: 'gm-1',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      role: 'general_manager' as const,
      managedUnits: ['unit-1', 'unit-2', 'unit-3'],
    },
  ],
  units: [
    {
      id: 'unit-1',
      name: 'Đơn vị Hà Nội',
      code: 'HN',
      manager: {
        id: 'um-1',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
      },
      salesTeam: [
        { id: 's-1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', ordersThisMonth: 45 },
        { id: 's-2', name: 'Lê Thị F', email: 'lethif@example.com', ordersThisMonth: 32 },
        { id: 's-3', name: 'Hoàng Minh G', email: 'hoangminhg@example.com', ordersThisMonth: 28 },
      ],
    },
    {
      id: 'unit-2',
      name: 'Đơn vị Hồ Chí Minh',
      code: 'HCM',
      manager: {
        id: 'um-2',
        name: 'Nguyễn Thị H',
        email: 'nguyenthih@example.com',
      },
      salesTeam: [
        { id: 's-4', name: 'Lê Văn C', email: 'levanc@example.com', ordersThisMonth: 51 },
        { id: 's-5', name: 'Trần Minh I', email: 'tranminhi@example.com', ordersThisMonth: 39 },
      ],
    },
    {
      id: 'unit-3',
      name: 'Đơn vị Đà Nẵng',
      code: 'DN',
      manager: {
        id: 'um-3',
        name: 'Phạm Văn K',
        email: 'phamvank@example.com',
      },
      salesTeam: [
        { id: 's-6', name: 'Hoàng Văn E', email: 'hoangvane@example.com', ordersThisMonth: 22 },
        { id: 's-7', name: 'Nguyễn Thị L', email: 'nguyenthil@example.com', ordersThisMonth: 18 },
        { id: 's-8', name: 'Trần Văn M', email: 'tranvanm@example.com', ordersThisMonth: 35 },
      ],
    },
  ],
};

interface UnitCardProps {
  unit: (typeof organizationData.units)[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function UnitCard({ unit, isExpanded, onToggle }: UnitCardProps) {
  return (
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
            </div>
            <p className="text-sm text-muted-foreground">
              {unit.salesTeam.length} nhân viên · {unit.salesTeam.reduce((acc, s) => acc + s.ordersThisMonth, 0)} đơn
              tháng này
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
              <DropdownMenuItem className="gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa đơn vị
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <UserPlus className="h-4 w-4" />
                Thêm nhân viên
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
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
          <div className="p-4 bg-amber-500/5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-semibold">
                  {unit.manager.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Briefcase className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{unit.manager.name}</p>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                    Quản lý Đơn vị
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{unit.manager.email}</p>
              </div>
            </div>
          </div>

          {/* Sales Team */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Đội ngũ Sales
              </p>
            </div>
            <div className="space-y-2">
              {unit.salesTeam.map((sales) => (
                <div
                  key={sales.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-medium text-sm">
                      {sales.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{sales.name}</p>
                      <p className="text-xs text-muted-foreground">{sales.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{sales.ordersThisMonth}</p>
                      <p className="text-xs text-muted-foreground">đơn/tháng</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3 w-3" />
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Organization() {
  const navigate = useNavigate();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['unit-1']));
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const totalSales = organizationData.units.reduce((acc, unit) => acc + unit.salesTeam.length, 0);
  const totalOrders = organizationData.units.reduce(
    (acc, unit) => acc + unit.salesTeam.reduce((a, s) => a + s.ordersThisMonth, 0),
    0
  );

  return (
    <DashboardLayout onLogout={() => navigate('/auth')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cây tổ chức</h1>
            <p className="text-muted-foreground">Quản lý cấu trúc tổ chức và phân quyền</p>
          </div>
          <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm đơn vị
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm đơn vị mới</DialogTitle>
                <DialogDescription>Tạo đơn vị mới trong cấu trúc tổ chức</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="unitName">Tên đơn vị</Label>
                  <Input id="unitName" placeholder="VD: Đơn vị Hải Phòng" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitCode">Mã đơn vị</Label>
                  <Input id="unitCode" placeholder="VD: HP" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUnitDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsAddUnitDialogOpen(false)}>Tạo đơn vị</Button>
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
                <p className="text-2xl font-bold text-foreground">{organizationData.generalManagers.length}</p>
                <p className="text-sm text-muted-foreground">Quản lý Cấp cao</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{organizationData.units.length}</p>
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
                <p className="text-2xl font-bold text-foreground">{organizationData.units.length}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalSales}</p>
                <p className="text-sm text-muted-foreground">Nhân viên Sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Tree */}
        <div className="space-y-4">
          {/* Level 1: General Manager */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Crown className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Quản lý Cấp cao</h2>
                <p className="text-sm text-muted-foreground">Quản lý toàn bộ hệ thống</p>
              </div>
            </div>
            <div className="ml-4 pl-4 border-l-2 border-emerald-500/30">
              {organizationData.generalManagers.map((gm) => (
                <div
                  key={gm.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                        {gm.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{gm.name}</p>
                      <p className="text-sm text-muted-foreground">{gm.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Quản lý {gm.managedUnits.length} đơn vị
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Level 2 & 3: Units with Managers and Sales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Các đơn vị</h2>
            </div>
            {organizationData.units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                isExpanded={expandedUnits.has(unit.id)}
                onToggle={() => toggleUnit(unit.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
