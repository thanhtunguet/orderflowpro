import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCircle2, ShoppingCart, DollarSign, Users, Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'order_created' | 'revenue_milestone' | 'customer_activity' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
  amount?: number;
  salesName?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order_created',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng DH001 đã được tạo bởi Trần Thị X',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    orderId: 'DH001',
    salesName: 'Trần Thị X',
  },
  {
    id: '2',
    type: 'order_created',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng DH002 đã được tạo bởi Lê Văn Y',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    orderId: 'DH002',
    salesName: 'Lê Văn Y',
  },
  {
    id: '3',
    type: 'revenue_milestone',
    title: 'Mốc doanh thu',
    message: 'Doanh thu tháng này đã đạt 400 triệu VNĐ',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amount: 400000000,
  },
  {
    id: '4',
    type: 'customer_activity',
    title: 'Khách hàng mua lại',
    message: 'Khách hàng Nguyễn Văn A (0901234567) đã mua lại lần thứ 3',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'order_created',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng DH003 đã được tạo bởi Phạm Văn Z',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    orderId: 'DH003',
    salesName: 'Phạm Văn Z',
  },
  {
    id: '6',
    type: 'system',
    title: 'Thông báo hệ thống',
    message: 'Bản cập nhật mới đã được áp dụng. Vui lòng làm mới trang để sử dụng tính năng mới.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order_created':
      return <ShoppingCart className="h-5 w-5 text-primary" />;
    case 'revenue_milestone':
      return <DollarSign className="h-5 w-5 text-success" />;
    case 'customer_activity':
      return <Users className="h-5 w-5 text-accent" />;
    case 'system':
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'order_created':
      return 'bg-primary/10 border-primary/20';
    case 'revenue_milestone':
      return 'bg-success/10 border-success/20';
    case 'customer_activity':
      return 'bg-accent/10 border-accent/20';
    case 'system':
      return 'bg-muted border-border';
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Thông báo</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? (
              <span>Bạn có <span className="font-semibold text-primary">{unreadCount}</span> thông báo chưa đọc</span>
            ) : (
              'Tất cả thông báo đã được đọc'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="lg" onClick={markAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Danh sách thông báo ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="divide-y divide-border">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                sortedNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className={`text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            {notification.orderId && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Mã đơn: {notification.orderId}
                              </Badge>
                            )}
                            {notification.amount && (
                              <Badge variant="outline" className="mt-2 text-xs ml-2">
                                {formatCurrency(notification.amount)}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                                title="Đánh dấu đã đọc"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                              title="Xóa thông báo"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

