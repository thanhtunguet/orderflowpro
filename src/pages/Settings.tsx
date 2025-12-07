import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Palette, Database, Save, Mail, Phone, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    role: 'unit_manager',
    unit: 'Đơn vị A',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderCreated: true,
    revenueMilestone: true,
    customerActivity: true,
    systemUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'vi',
    dateFormat: 'dd/MM/yyyy',
    currency: 'VND',
    autoRefresh: true,
    refreshInterval: 30,
  });

  const handleLogout = () => {
    navigate('/auth');
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đã cập nhật thông tin cá nhân');
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đã cập nhật cài đặt thông báo');
    }, 1000);
  };

  const handleSaveApp = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đã cập nhật cài đặt ứng dụng');
    }, 1000);
  };

  return (
    <DashboardLayout onLogout={handleLogout} userName={profileData.fullName} userRole={profileData.role}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý cài đặt tài khoản và ứng dụng</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="app">Ứng dụng</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Input
                  id="role"
                  value="Quản lý Đơn vị"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="unit"
                    className="pl-10"
                    value={profileData.unit}
                    onChange={(e) => setProfileData({ ...profileData, unit: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <Button onClick={handleSaveProfile} disabled={isLoading} variant="accent" size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>Quản lý các loại thông báo bạn muốn nhận</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="orderCreated">Thông báo đơn hàng mới</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo khi có đơn hàng mới được tạo
                    </p>
                  </div>
                  <Switch
                    id="orderCreated"
                    checked={notificationSettings.orderCreated}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, orderCreated: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="revenueMilestone">Thông báo mốc doanh thu</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo khi đạt các mốc doanh thu quan trọng
                    </p>
                  </div>
                  <Switch
                    id="revenueMilestone"
                    checked={notificationSettings.revenueMilestone}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, revenueMilestone: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="customerActivity">Thông báo hoạt động khách hàng</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về hoạt động của khách hàng (mua lại, v.v.)
                    </p>
                  </div>
                  <Switch
                    id="customerActivity"
                    checked={notificationSettings.customerActivity}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, customerActivity: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemUpdates">Thông báo cập nhật hệ thống</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về các cập nhật và bảo trì hệ thống
                    </p>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Phương thức nhận thông báo</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Thông báo qua Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo đến địa chỉ email của bạn
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Thông báo Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị thông báo trên thiết bị của bạn
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>
              </div>
              <Separator />
              <Button onClick={handleSaveNotifications} disabled={isLoading} variant="accent" size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="app" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Cài đặt ứng dụng
              </CardTitle>
              <CardDescription>Tùy chỉnh giao diện và hành vi ứng dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Giao diện</Label>
                <Select
                  value={appSettings.theme}
                  onValueChange={(value) => setAppSettings({ ...appSettings, theme: value })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Sáng</SelectItem>
                    <SelectItem value="dark">Tối</SelectItem>
                    <SelectItem value="auto">Tự động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select
                  value={appSettings.language}
                  onValueChange={(value) => setAppSettings({ ...appSettings, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Định dạng ngày</Label>
                <Select
                  value={appSettings.dateFormat}
                  onValueChange={(value) => setAppSettings({ ...appSettings, dateFormat: value })}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                <Select
                  value={appSettings.currency}
                  onValueChange={(value) => setAppSettings({ ...appSettings, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VNĐ (Việt Nam Đồng)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRefresh">Tự động làm mới dữ liệu</Label>
                  <p className="text-sm text-muted-foreground">
                    Tự động cập nhật dữ liệu theo khoảng thời gian đã đặt
                  </p>
                </div>
                <Switch
                  id="autoRefresh"
                  checked={appSettings.autoRefresh}
                  onCheckedChange={(checked) =>
                    setAppSettings({ ...appSettings, autoRefresh: checked })
                  }
                />
              </div>
              {appSettings.autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Khoảng thời gian làm mới (giây)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    min={10}
                    max={300}
                    value={appSettings.refreshInterval}
                    onChange={(e) =>
                      setAppSettings({ ...appSettings, refreshInterval: parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
              )}
              <Separator />
              <Button onClick={handleSaveApp} disabled={isLoading} variant="accent" size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Bảo mật
              </CardTitle>
              <CardDescription>Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input id="currentPassword" type="password" placeholder="Nhập mật khẩu hiện tại" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input id="newPassword" type="password" placeholder="Nhập mật khẩu mới" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" />
                </div>
                <Button variant="accent" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Phiên đăng nhập</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Thiết bị hiện tại</p>
                      <p className="text-sm text-muted-foreground">Chrome trên macOS • Đăng nhập lúc 15:30 hôm nay</p>
                    </div>
                    <Badge variant="secondary">Đang hoạt động</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

