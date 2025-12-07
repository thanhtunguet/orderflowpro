import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, UserCheck } from 'lucide-react';
import { CUSTOMER_SOURCE_LABELS } from '@/types/order';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value) + 'đ';
};

const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

// Mock data
const dailyRevenueData = [
  { name: 'T2', revenue: 45000000, orders: 12 },
  { name: 'T3', revenue: 52000000, orders: 15 },
  { name: 'T4', revenue: 48000000, orders: 13 },
  { name: 'T5', revenue: 61000000, orders: 18 },
  { name: 'T6', revenue: 55000000, orders: 16 },
  { name: 'T7', revenue: 78000000, orders: 22 },
  { name: 'CN', revenue: 65000000, orders: 19 },
];

const monthlyRevenueData = [
  { name: 'T1', revenue: 1200000000, orders: 350 },
  { name: 'T2', revenue: 1350000000, orders: 380 },
  { name: 'T3', revenue: 1500000000, orders: 420 },
  { name: 'T4', revenue: 1450000000, orders: 410 },
  { name: 'T5', revenue: 1600000000, orders: 450 },
  { name: 'T6', revenue: 1700000000, orders: 480 },
];

const sourceRevenueData = [
  { name: 'Facebook Ads', value: 450000000, percentage: 35, color: 'hsl(222, 59%, 25%)' },
  { name: 'Hotline', value: 320000000, percentage: 25, color: 'hsl(32, 95%, 55%)' },
  { name: 'Zalo OA', value: 256000000, percentage: 20, color: 'hsl(152, 69%, 31%)' },
  { name: 'Walk-in', value: 153600000, percentage: 12, color: 'hsl(200, 70%, 50%)' },
  { name: 'Referral', value: 102400000, percentage: 8, color: 'hsl(280, 60%, 50%)' },
];

const productData = [
  { name: 'Sản phẩm Premium A', revenue: 450000000, orders: 180, quantity: 360 },
  { name: 'Sản phẩm Standard B', revenue: 320000000, orders: 240, quantity: 480 },
  { name: 'Sản phẩm Basic C', revenue: 280000000, orders: 350, quantity: 1050 },
  { name: 'Sản phẩm Deluxe D', revenue: 250000000, orders: 125, quantity: 250 },
];

const retentionData = [
  { name: 'Khách mới', value: 89, revenue: 450000000, percentage: 70 },
  { name: 'Khách mua lại', value: 38, revenue: 830000000, percentage: 30 },
];

const comparisonData = [
  { period: 'Tháng này', revenue: 1700000000, orders: 480, customers: 127 },
  { period: 'Cùng kỳ năm trước', revenue: 1450000000, orders: 410, customers: 108 },
];

export default function Reports() {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState<'this_month' | 'last_month' | 'this_year' | 'custom'>('this_month');

  const handleLogout = () => {
    navigate('/auth');
  };

  const currentRevenue = comparisonData[0].revenue;
  const previousRevenue = comparisonData[1].revenue;
  const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

  return (
    <DashboardLayout onLogout={handleLogout} userName="Nguyễn Văn A" userRole="unit_manager">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground mt-1">Xem báo cáo chi tiết về doanh thu và khách hàng</p>
        </div>
        <Button variant="accent" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Khoảng thời gian:</span>
            </div>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">Tháng này</SelectItem>
                <SelectItem value="last_month">Tháng trước</SelectItem>
                <SelectItem value="this_year">Năm nay</SelectItem>
                <SelectItem value="custom">Tùy chọn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as typeof periodFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Theo ngày</SelectItem>
                <SelectItem value="week">Theo tuần</SelectItem>
                <SelectItem value="month">Theo tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(currentRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm ${revenueGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">so với cùng kỳ</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                <p className="text-2xl font-bold mt-1">{comparisonData[0].orders}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tăng {comparisonData[0].orders - comparisonData[1].orders} đơn
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                <p className="text-2xl font-bold mt-1 text-success">{retentionData[0].value}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {retentionData[0].percentage}% tổng khách hàng
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Khách mua lại</p>
                <p className="text-2xl font-bold mt-1 text-accent">{retentionData[1].value}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {retentionData[1].percentage}% tổng khách hàng
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="comparison">So sánh</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Doanh thu theo thời gian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={periodFilter === 'day' ? dailyRevenueData : monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(222, 59%, 25%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(222, 59%, 25%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px hsl(222, 47%, 11%, 0.1)',
                        }}
                        formatter={(value: number) => [formatCurrencyFull(value), 'Doanh thu']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(222, 59%, 25%)"
                        strokeWidth={2.5}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Doanh thu theo nguồn khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceRevenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sourceRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px hsl(222, 47%, 11%, 0.1)',
                        }}
                        formatter={(value: number) => [formatCurrencyFull(value), 'Doanh thu']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: 'hsl(222, 47%, 11%)', fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Phân tích khách hàng cũ vs mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-success">Khách hàng mới</span>
                      <span className="text-2xl font-bold text-success">{retentionData[0].value}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Doanh thu: {formatCurrencyFull(retentionData[0].revenue)}
                    </div>
                    <div className="mt-2 h-2 bg-success/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${retentionData[0].percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-accent">Khách mua lại</span>
                      <span className="text-2xl font-bold text-accent">{retentionData[1].value}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Doanh thu: {formatCurrencyFull(retentionData[1].revenue)}
                    </div>
                    <div className="mt-2 h-2 bg-accent/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${retentionData[1].percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={retentionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {retentionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? 'hsl(152, 69%, 31%)' : 'hsl(32, 95%, 55%)'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px hsl(222, 47%, 11%, 0.1)',
                        }}
                        formatter={(value: number) => [`${value} khách hàng`, 'Số lượng']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px hsl(222, 47%, 11%, 0.1)',
                      }}
                      formatter={(value: number) => [formatCurrencyFull(value), 'Doanh thu']}
                    />
                    <Bar dataKey="revenue" fill="hsl(222, 59%, 25%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">So sánh cùng kỳ (YoY/MoM)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px hsl(222, 47%, 11%, 0.1)',
                      }}
                      formatter={(value: number) => [formatCurrencyFull(value), 'Doanh thu']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(222, 59%, 25%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tăng trưởng doanh thu</p>
                  <p className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tăng trưởng đơn hàng</p>
                  <p className="text-2xl font-bold text-success">
                    +{((comparisonData[0].orders - comparisonData[1].orders) / comparisonData[1].orders * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tăng trưởng khách hàng</p>
                  <p className="text-2xl font-bold text-success">
                    +{((comparisonData[0].customers - comparisonData[1].customers) / comparisonData[1].customers * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

