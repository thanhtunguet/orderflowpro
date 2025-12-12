import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter, Download, Phone, ShoppingCart, Calendar, UserCheck, UserPlus, Table2, List } from 'lucide-react';
import { CUSTOMER_SOURCE_LABELS, type CustomerSource } from '@/types/order';
import { useIsMobile } from '@/hooks/use-mobile';

interface Customer {
  id: string;
  name: string;
  phone: string;
  source: CustomerSource;
  isReturning: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    source: 'facebook_ads',
    isReturning: false,
    totalOrders: 3,
    totalSpent: 15000000,
    firstOrderDate: '2024-01-10',
    lastOrderDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0912345678',
    source: 'hotline',
    isReturning: true,
    totalOrders: 5,
    totalSpent: 25000000,
    firstOrderDate: '2023-12-05',
    lastOrderDate: '2024-01-15',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    phone: '0923456789',
    source: 'walkin',
    isReturning: false,
    totalOrders: 1,
    totalSpent: 3600000,
    firstOrderDate: '2024-01-14',
    lastOrderDate: '2024-01-14',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    phone: '0934567890',
    source: 'zalo_oa',
    isReturning: true,
    totalOrders: 8,
    totalSpent: 40000000,
    firstOrderDate: '2023-11-20',
    lastOrderDate: '2024-01-14',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    phone: '0945678901',
    source: 'referral',
    isReturning: false,
    totalOrders: 2,
    totalSpent: 8000000,
    firstOrderDate: '2024-01-12',
    lastOrderDate: '2024-01-14',
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

type ViewMode = 'table' | 'list';

export default function Customers() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'new' | 'returning'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Auto-switch to list view on mobile (only once on initial load)
  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    }
  }, [isMobile]);

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
    
    const matchesType = 
      customerTypeFilter === 'all' ||
      (customerTypeFilter === 'returning' && customer.isReturning) ||
      (customerTypeFilter === 'new' && !customer.isReturning);
    
    return matchesSearch && matchesSource && matchesType;
  });

  const newCustomers = filteredCustomers.filter(c => !c.isReturning);
  const returningCustomers = filteredCustomers.filter(c => c.isReturning);

  const renderCustomerTable = (customers: Customer[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Nguồn</TableHead>
            <TableHead className="text-center">Số đơn</TableHead>
            <TableHead className="text-right">Tổng chi tiêu</TableHead>
            <TableHead>Đơn đầu tiên</TableHead>
            <TableHead>Đơn gần nhất</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Không tìm thấy khách hàng nào
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{customer.name}</span>
                    {customer.isReturning && (
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Khách cũ
                      </Badge>
                    )}
                    {!customer.isReturning && (
                      <Badge variant="outline" className="text-xs">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Khách mới
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {CUSTOMER_SOURCE_LABELS[customer.source]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer.totalOrders}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(customer.firstOrderDate).toLocaleDateString('vi-VN')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCustomerList = (customers: Customer[]) => (
    <div className="space-y-3">
      {customers.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Không tìm thấy khách hàng nào
        </div>
      ) : (
        customers.map((customer) => (
          <Card key={customer.id} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    {customer.isReturning ? (
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Khách cũ
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Khách mới
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary text-lg">{formatCurrency(customer.totalSpent)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {customer.totalOrders} đơn hàng
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nguồn:</span>
                  <div className="mt-0.5">
                    <Badge variant="outline" className="text-xs">
                      {CUSTOMER_SOURCE_LABELS[customer.source]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Số đơn:</span>
                  <div className="flex items-center gap-1 font-medium mt-0.5">
                    <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                    {customer.totalOrders}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Đơn đầu tiên:</span>
                  <div className="flex items-center gap-1 font-medium mt-0.5">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(customer.firstOrderDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Đơn gần nhất:</span>
                  <div className="flex items-center gap-1 font-medium mt-0.5">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý khách hàng</h1>
          <p className="text-muted-foreground mt-1">Xem và quản lý thông tin khách hàng</p>
        </div>
        <Button variant="outline" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
                <p className="text-2xl font-bold mt-1">{filteredCustomers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                <p className="text-2xl font-bold mt-1 text-success">{newCustomers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách mua lại</p>
                <p className="text-2xl font-bold mt-1 text-accent">{returningCustomers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Nguồn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                {Object.entries(CUSTOMER_SOURCE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customerTypeFilter} onValueChange={(v) => setCustomerTypeFilter(v as typeof customerTypeFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Loại khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="new">Khách mới</SelectItem>
                <SelectItem value="returning">Khách mua lại</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table/List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách khách hàng ({filteredCustomers.length})</CardTitle>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả ({filteredCustomers.length})</TabsTrigger>
              <TabsTrigger value="new">Khách mới ({newCustomers.length})</TabsTrigger>
              <TabsTrigger value="returning">Khách mua lại ({returningCustomers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              {viewMode === 'table' ? renderCustomerTable(filteredCustomers) : renderCustomerList(filteredCustomers)}
            </TabsContent>
            <TabsContent value="new" className="mt-0">
              {viewMode === 'table' ? renderCustomerTable(newCustomers) : renderCustomerList(newCustomers)}
            </TabsContent>
            <TabsContent value="returning" className="mt-0">
              {viewMode === 'table' ? renderCustomerTable(returningCustomers) : renderCustomerList(returningCustomers)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

