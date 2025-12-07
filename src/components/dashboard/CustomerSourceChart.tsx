import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Facebook Ads', value: 35, color: 'hsl(222, 59%, 25%)' },
  { name: 'Hotline', value: 25, color: 'hsl(32, 95%, 55%)' },
  { name: 'Zalo OA', value: 20, color: 'hsl(152, 69%, 31%)' },
  { name: 'Walk-in', value: 12, color: 'hsl(200, 70%, 50%)' },
  { name: 'Referral', value: 8, color: 'hsl(280, 60%, 50%)' },
];

export function CustomerSourceChart() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Nguồn khách hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
                formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
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
  );
}
