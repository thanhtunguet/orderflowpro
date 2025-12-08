-- =============================================
-- ORDER MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =============================================
-- Version: 1.0
-- Last Updated: 2025-12-08
-- 
-- This document describes the complete database schema
-- for the Order Management System with 3-level authorization:
-- - Sales: Can only view their own orders
-- - Unit Manager: Can view all orders in their unit
-- - General Manager: Can view orders from multiple managed units
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- User roles for authorization
CREATE TYPE public.app_role AS ENUM (
  'sales',           -- Sales employee
  'unit_manager',    -- Unit manager (manages 1 unit)
  'general_manager'  -- General manager (manages 2+ units)
);

-- Customer acquisition source
CREATE TYPE public.customer_source AS ENUM (
  'hotline',              -- 1. Hotline/Call center
  'facebook_ads',         -- 2. Facebook Ads
  'zalo_oa',              -- 3. Zalo OA
  'walk_in',              -- 4. Walk-in
  'referral',             -- 5. Referral
  'returning_via_ads',    -- 6. Returning customer via Ads
  'returning_not_ads'     -- 7. Returning customer not via Ads
);

-- Customer type classification
CREATE TYPE public.customer_type AS ENUM (
  'new',       -- New customer
  'returning'  -- Returning customer
);

-- =============================================
-- TABLES
-- =============================================

-- Units table: Business units/branches
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,           -- Unit code (e.g., 'HN01', 'HCM01')
  name TEXT NOT NULL,                  -- Unit name
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles: Extended user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,        -- References auth.users(id)
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  unit_id UUID REFERENCES public.units(id), -- Which unit user belongs to
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles: Role assignments (separate table for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,               -- References auth.users(id)
  role public.app_role NOT NULL DEFAULT 'sales',
  UNIQUE(user_id, role)
);

-- Manager units: Which units a general manager manages
CREATE TABLE public.manager_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,               -- General manager user id
  unit_id UUID NOT NULL REFERENCES public.units(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- Customers table: Customer information
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,                 -- Primary identifier (or "Không có số")
  name TEXT,
  first_order_source public.customer_source,
  first_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table: Order transactions
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,   -- Auto-generated: ORD-YYYYMMDD-XXXXXX
  
  -- Customer info (denormalized for quick access)
  customer_id UUID REFERENCES public.customers(id),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_source public.customer_source NOT NULL,
  customer_type public.customer_type NOT NULL,
  
  -- Product info
  product_name TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  
  -- Ownership
  sales_id UUID NOT NULL,              -- Sales person who created this order
  unit_id UUID NOT NULL REFERENCES public.units(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SEQUENCES
-- =============================================

-- Sequence for order number generation
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- UNITS: All authenticated users can view
CREATE POLICY "Authenticated users can view units"
  ON public.units FOR SELECT
  TO authenticated
  USING (true);

-- PROFILES: Users can view/update their own + managers can view subordinates
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Managers can view profiles in their scope"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (public.has_role(auth.uid(), 'unit_manager') AND unit_id = public.get_user_unit_id(auth.uid()))
    OR
    (public.has_role(auth.uid(), 'general_manager') AND public.manages_unit(auth.uid(), unit_id))
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- USER_ROLES: Users can only view their own roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- MANAGER_UNITS: Managers can view their managed units
CREATE POLICY "Users can view their managed units"
  ON public.manager_units FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- CUSTOMERS: All authenticated users can CRUD
CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ORDERS: Role-based access control
CREATE POLICY "Users can view orders in their scope"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.can_access_order(auth.uid(), sales_id, unit_id));

CREATE POLICY "Sales can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (sales_id = auth.uid());

CREATE POLICY "Sales can update their own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (sales_id = auth.uid())
  WITH CHECK (sales_id = auth.uid());

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if general manager manages a specific unit
CREATE OR REPLACE FUNCTION public.manages_unit(_user_id UUID, _unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_units
    WHERE user_id = _user_id AND unit_id = _unit_id
  )
$$;

-- Get user's unit_id from profile
CREATE OR REPLACE FUNCTION public.get_user_unit_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user can access a specific order
CREATE OR REPLACE FUNCTION public.can_access_order(
  _user_id UUID,
  _order_sales_id UUID,
  _order_unit_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Sales can only see their own orders
    (_order_sales_id = _user_id)
    OR
    -- Unit Manager can see orders from their unit
    (public.has_role(_user_id, 'unit_manager') AND public.get_user_unit_id(_user_id) = _order_unit_id)
    OR
    -- General Manager can see orders from managed units
    (public.has_role(_user_id, 'general_manager') AND public.manages_unit(_user_id, _order_unit_id))
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Auto-create profile and assign default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default sales role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES (for performance)
-- =============================================

CREATE INDEX idx_profiles_unit_id ON public.profiles(unit_id);
CREATE INDEX idx_orders_sales_id ON public.orders(sales_id);
CREATE INDEX idx_orders_unit_id ON public.orders(unit_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_manager_units_user_id ON public.manager_units(user_id);
