// Enums for customer sources
export type CustomerSource = 
  | 'hotline'
  | 'facebook_ads'
  | 'zalo_oa'
  | 'walkin'
  | 'referral'
  | 'returning_with_ads'
  | 'returning_without_ads';

export type CustomerType = 'new' | 'returning';

export type UserRole = 'sales' | 'unit_manager' | 'general_manager';

export const CUSTOMER_SOURCE_LABELS: Record<CustomerSource, string> = {
  hotline: 'Hotline / Tổng đài',
  facebook_ads: 'Facebook Ads (Quảng cáo)',
  zalo_oa: 'Zalo OA',
  walkin: 'Khách tại cửa hàng (Walk-in)',
  referral: 'Khách giới thiệu (Referral)',
  returning_with_ads: 'Khách mua lại qua Quảng cáo',
  returning_without_ads: 'Khách mua lại không qua Quảng cáo',
};

export const RETURNING_SOURCES: CustomerSource[] = ['returning_with_ads', 'returning_without_ads'];

export interface Order {
  id: string;
  customer_phone: string;
  customer_name?: string;
  customer_source: CustomerSource;
  customer_type: CustomerType;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
  sales_id: string;
  unit_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  unit_id?: string;
  managed_units?: string[];
  avatar_url?: string;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  manager_id?: string;
  created_at: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  returningCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
}
