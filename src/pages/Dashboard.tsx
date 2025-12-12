import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CustomerSourceChart } from '@/components/dashboard/CustomerSourceChart';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { DollarSign, ShoppingCart, Users, UserCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value) + 'đ';
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Xin chào, đây là tình hình kinh doanh hôm nay</p>
        </div>
        <Button variant="accent" size="lg" onClick={() => navigate('/orders/new')}>
          <Plus className="h-5 w-5" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(404000000)}
          subtitle="Tháng này"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend={12.5}
          variant="primary"
        />
        <StatCard
          title="Đơn hàng"
          value="127"
          subtitle="Tháng này"
          icon={<ShoppingCart className="h-6 w-6 text-accent" />}
          trend={8.2}
          variant="accent"
        />
        <StatCard
          title="Khách hàng mới"
          value="89"
          subtitle="Tháng này"
          icon={<Users className="h-6 w-6 text-success" />}
          trend={15.3}
          variant="success"
        />
        <StatCard
          title="Khách mua lại"
          value="38"
          subtitle="Tỷ lệ 29.9%"
          icon={<UserCheck className="h-6 w-6 text-muted-foreground" />}
          trend={-2.1}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <CustomerSourceChart />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </DashboardLayout>
  );
}