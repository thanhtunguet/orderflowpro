import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Phone, User, Package, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CUSTOMER_SOURCE_LABELS, RETURNING_SOURCES, type CustomerSource } from '@/types/order';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock existing customers for demo
const existingCustomers: Record<string, { name: string; source: CustomerSource }> = {
  '0901234567': { name: 'Nguyễn Văn A', source: 'facebook_ads' },
  '0912345678': { name: 'Trần Thị B', source: 'hotline' },
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    customerName: '',
    source: '' as CustomerSource | '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    notes: '',
  });

  // Check if phone exists in database
  useEffect(() => {
    if (formData.phone.length >= 10) {
      const existing = existingCustomers[formData.phone];
      if (existing) {
        setIsExistingCustomer(true);
        setFormData(prev => ({
          ...prev,
          customerName: existing.name,
          source: existing.source,
        }));
      } else {
        setIsExistingCustomer(false);
        if (formData.customerName && existingCustomers[formData.phone]?.name === formData.customerName) {
          setFormData(prev => ({ ...prev, customerName: '', source: '' }));
        }
      }
    } else {
      setIsExistingCustomer(false);
    }
  }, [formData.phone]);

  const totalAmount = formData.quantity * formData.unitPrice;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.source || !formData.productName) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Tạo đơn hàng thành công!');
      navigate('/orders');
    }, 1000);
  };

  // Filter sources based on customer type
  const availableSources = isExistingCustomer 
    ? Object.entries(CUSTOMER_SOURCE_LABELS)
    : Object.entries(CUSTOMER_SOURCE_LABELS);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tạo đơn hàng mới</h1>
          <p className="text-muted-foreground mt-1">Nhập thông tin đơn hàng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* Customer Info */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Thông tin khách hàng
            </CardTitle>
            <CardDescription>Nhập số điện thoại để kiểm tra khách hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567 hoặc 'Không có số'"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {isExistingCustomer && (
              <Alert className="bg-success/10 border-success/20">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Khách hàng đã có trong hệ thống. Thông tin nguồn được tự động điền.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerName">Tên khách hàng</Label>
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                disabled={isExistingCustomer}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Nguồn khách hàng *</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData({ ...formData, source: value as CustomerSource })}
                disabled={isExistingCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {availableSources.map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.phone === 'Không có số' && (
                <p className="text-xs text-muted-foreground">
                  Nếu là khách mua lại, vui lòng chọn "Khách mua lại qua Quảng cáo" hoặc "Khách mua lại không qua Quảng cáo"
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Thông tin sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Tên sản phẩm *</Label>
              <Input
                id="productName"
                placeholder="Sản phẩm Premium A"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Đơn giá (VNĐ)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min={0}
                  step={1000}
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ghi chú thêm về đơn hàng..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/orders')}>
            Hủy
          </Button>
          <Button type="submit" variant="accent" size="lg" disabled={isLoading} className="flex-1">
            {isLoading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}