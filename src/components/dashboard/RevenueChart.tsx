import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'T2', revenue: 45000000, orders: 12 },
  { name: 'T3', revenue: 52000000, orders: 15 },
  { name: 'T4', revenue: 48000000, orders: 13 },
  { name: 'T5', revenue: 61000000, orders: 18 },
  { name: 'T6', revenue: 55000000, orders: 16 },
  { name: 'T7', revenue: 78000000, orders: 22 },
  { name: 'CN', revenue: 65000000, orders: 19 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value) + 'đ';
};

export function RevenueChart() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Doanh thu theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                labelStyle={{ color: 'hsl(222, 47%, 11%)', fontWeight: 600, marginBottom: 4 }}
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
  );
}
