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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Search, Filter, Download, Phone, Calendar, Table2, List } from 'lucide-react';
import { CUSTOMER_SOURCE_LABELS, type CustomerSource } from '@/types/order';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderRow {
  id: string;
  customerName: string;
  phone: string;
  product: string;
  quantity: number;
  amount: number;
  source: CustomerSource;
  isReturning: boolean;
  salesName: string;
  createdAt: string;
}

const mockOrders: OrderRow[] = [
  { id: 'DH001', customerName: 'Nguyễn Văn A', phone: '0901234567', product: 'Sản phẩm Premium A', quantity: 2, amount: 5000000, source: 'facebook_ads', isReturning: false, salesName: 'Trần Thị X', createdAt: '2024-01-15 10:30' },
  { id: 'DH002', customerName: 'Trần Thị B', phone: '0912345678', product: 'Sản phẩm Standard B', quantity: 1, amount: 2500000, source: 'hotline', isReturning: true, salesName: 'Lê Văn Y', createdAt: '2024-01-15 09:15' },
  { id: 'DH003', customerName: 'Lê Văn C', phone: '0923456789', product: 'Sản phẩm Basic C', quantity: 3, amount: 3600000, source: 'walkin', isReturning: false, salesName: 'Trần Thị X', createdAt: '2024-01-14 16:45' },
  { id: 'DH004', customerName: 'Phạm Thị D', phone: '0934567890', product: 'Sản phẩm Premium A', quantity: 1, amount: 2500000, source: 'zalo_oa', isReturning: true, salesName: 'Phạm Văn Z', createdAt: '2024-01-14 14:20' },
  { id: 'DH005', customerName: 'Hoàng Văn E', phone: '0945678901', product: 'Sản phẩm Deluxe D', quantity: 2, amount: 8000000, source: 'referral', isReturning: false, salesName: 'Lê Văn Y', createdAt: '2024-01-14 11:00' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

type ViewMode = 'table' | 'list';

export default function Orders() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Auto-switch to list view on mobile (only once on initial load)
  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    }
  }, [isMobile]);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || order.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Xem và quản lý tất cả đơn hàng</p>
        </div>
        <Button variant="accent" size="lg" onClick={() => navigate('/orders/new')}>
          <Plus className="h-5 w-5" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT, mã đơn..."
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table/List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
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
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Không tìm thấy đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium text-primary">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.customerName}</span>
                              {order.isReturning && (
                                <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                                  Khách cũ
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <Phone className="h-3 w-3" />
                              {order.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span>{order.product}</span>
                            <span className="text-muted-foreground ml-1">x{order.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(order.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {CUSTOMER_SOURCE_LABELS[order.source]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.salesName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {order.createdAt}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Không tìm thấy đơn hàng nào
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-primary">{order.id}</span>
                            {order.isReturning && (
                              <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                                Khách cũ
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{order.customerName}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <Phone className="h-3 w-3" />
                            {order.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary text-lg">{formatCurrency(order.amount)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sản phẩm:</span>
                          <div className="font-medium mt-0.5">
                            {order.product} <span className="text-muted-foreground">x{order.quantity}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nguồn:</span>
                          <div className="mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {CUSTOMER_SOURCE_LABELS[order.source]}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sales:</span>
                          <div className="font-medium mt-0.5">{order.salesName}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Thời gian:</span>
                          <div className="flex items-center gap-1 font-medium mt-0.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {order.createdAt}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}