import { useState } from 'react';
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
import { Plus, Search, Filter, Download, Phone, Calendar } from 'lucide-react';
import { CUSTOMER_SOURCE_LABELS, type CustomerSource } from '@/types/order';

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

export default function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const handleLogout = () => {
    navigate('/auth');
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || order.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  return (
    <DashboardLayout onLogout={handleLogout} userName="Nguyễn Văn A" userRole="unit_manager">
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

      {/* Orders Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                {filteredOrders.map((order) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}