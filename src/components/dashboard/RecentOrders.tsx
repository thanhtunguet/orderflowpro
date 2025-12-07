import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  product: string;
  amount: number;
  time: string;
  isReturning: boolean;
}

const recentOrders: Order[] = [
  { id: '1', customerName: 'Nguyễn Văn A', phone: '0901234567', product: 'Sản phẩm A', amount: 2500000, time: '10 phút trước', isReturning: false },
  { id: '2', customerName: 'Trần Thị B', phone: '0912345678', product: 'Sản phẩm B', amount: 4800000, time: '25 phút trước', isReturning: true },
  { id: '3', customerName: 'Lê Văn C', phone: '0923456789', product: 'Sản phẩm C', amount: 1200000, time: '1 giờ trước', isReturning: false },
  { id: '4', customerName: 'Phạm Thị D', phone: '0934567890', product: 'Sản phẩm D', amount: 3600000, time: '2 giờ trước', isReturning: true },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export function RecentOrders() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Đơn hàng gần đây</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <div
              key={order.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors",
                index === 0 && "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {order.customerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    {order.isReturning && (
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                        Khách cũ
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {order.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {order.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(order.amount)}</p>
                <p className="text-sm text-muted-foreground">{order.product}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
