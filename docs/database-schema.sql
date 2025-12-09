-- =============================================
-- ORDER MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =============================================
-- Version: 1.1
-- Last Updated: 2025-12-09
-- 
-- This document describes the complete database schema
-- for the Order Management System with:
-- - 3 user roles: sales, unit_manager, general_manager
-- - Multi-level organization tree (unlimited levels via parent_id)
-- - Role-based access control with RLS policies
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- User roles for authorization
CREATE TYPE public.app_role AS ENUM (
  'sales',           -- Nhân viên (Sales employee)
  'unit_manager',    -- Quản lý Đơn vị (Unit manager)
  'general_manager'  -- Quản lý Chung (General manager)
);

-- Customer acquisition source
CREATE TYPE public.customer_source AS ENUM (
  'hotline',                -- 1. Hotline/Call center
  'facebook_ads',           -- 2. Facebook Ads
  'zalo_oa',                -- 3. Zalo OA
  'walkin',                 -- 4. Walk-in
  'referral',               -- 5. Referral
  'returning_with_ads',     -- 6. Returning customer via Ads
  'returning_without_ads'   -- 7. Returning customer not via Ads
);

-- Customer type classification
CREATE TYPE public.customer_type AS ENUM (
  'new',       -- New customer
  'returning'  -- Returning customer
);

-- =============================================
-- TABLES
-- =============================================

-- Units table: Business units with hierarchical structure (unlimited levels)
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,           -- Unit code (e.g., 'HN01', 'HCM01')
  name TEXT NOT NULL,                  -- Unit name
  parent_id UUID REFERENCES public.units(id) ON DELETE SET NULL, -- Parent unit for hierarchy
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

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_units_parent_id ON public.units(parent_id);
CREATE INDEX idx_profiles_unit_id ON public.profiles(unit_id);
CREATE INDEX idx_orders_sales_id ON public.orders(sales_id);
CREATE INDEX idx_orders_unit_id ON public.orders(unit_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_manager_units_user_id ON public.manager_units(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if general manager manages a specific unit
CREATE OR REPLACE FUNCTION public.manages_unit(_user_id UUID, _unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_units
    WHERE user_id = _user_id AND unit_id = _unit_id
  )
$$;

-- Get user's unit_id from profile
CREATE OR REPLACE FUNCTION public.get_user_unit_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT unit_id FROM public.profiles WHERE id = _user_id
$$;

-- Get all descendant units of a unit (recursive)
CREATE OR REPLACE FUNCTION public.get_descendant_units(_unit_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH RECURSIVE unit_tree AS (
    SELECT id FROM public.units WHERE id = _unit_id
    UNION ALL
    SELECT u.id FROM public.units u
    INNER JOIN unit_tree ut ON u.parent_id = ut.id
  )
  SELECT id FROM unit_tree WHERE id != _unit_id
$$;

-- Get all ancestor units of a unit (recursive)
CREATE OR REPLACE FUNCTION public.get_ancestor_units(_unit_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH RECURSIVE unit_tree AS (
    SELECT id, parent_id FROM public.units WHERE id = _unit_id
    UNION ALL
    SELECT u.id, u.parent_id FROM public.units u
    INNER JOIN unit_tree ut ON u.id = ut.parent_id
  )
  SELECT id FROM unit_tree WHERE id != _unit_id
$$;

-- Check if user can manage a unit (including descendants)
CREATE OR REPLACE FUNCTION public.can_manage_unit(_user_id UUID, _unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    -- General manager can manage assigned units and their descendants
    (public.has_role(_user_id, 'general_manager') AND (
      public.manages_unit(_user_id, _unit_id) OR
      EXISTS (
        SELECT 1 FROM public.manager_units mu
        WHERE mu.user_id = _user_id
        AND _unit_id IN (SELECT public.get_descendant_units(mu.unit_id))
      )
    ))
    OR
    -- Unit manager can manage their unit and descendants
    (public.has_role(_user_id, 'unit_manager') AND (
      public.get_user_unit_id(_user_id) = _unit_id OR
      _unit_id IN (SELECT public.get_descendant_units(public.get_user_unit_id(_user_id)))
    ))
$$;

-- Check if user can access a specific order
CREATE OR REPLACE FUNCTION public.can_access_order(
  _user_id UUID,
  _order_sales_id UUID,
  _order_unit_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    (_order_sales_id = _user_id)
    OR
    (public.has_role(_user_id, 'unit_manager') AND public.get_user_unit_id(_user_id) = _order_unit_id)
    OR
    (public.has_role(_user_id, 'general_manager') AND public.manages_unit(_user_id, _order_unit_id))
$$;

-- =============================================
-- RLS POLICIES - UNITS
-- =============================================

CREATE POLICY "Authenticated users can view units"
  ON public.units FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can insert units"
  ON public.units FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'general_manager') OR
    public.has_role(auth.uid(), 'unit_manager')
  );

CREATE POLICY "Managers can update their units"
  ON public.units FOR UPDATE TO authenticated
  USING (public.can_manage_unit(auth.uid(), id))
  WITH CHECK (public.can_manage_unit(auth.uid(), id));

CREATE POLICY "Managers can delete their units"
  ON public.units FOR DELETE TO authenticated
  USING (public.can_manage_unit(auth.uid(), id));

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Managers can view profiles in their scope"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    (public.has_role(auth.uid(), 'unit_manager') AND unit_id = public.get_user_unit_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'unit_manager') AND unit_id IN (SELECT public.get_descendant_units(public.get_user_unit_id(auth.uid())))) OR
    (public.has_role(auth.uid(), 'general_manager') AND public.manages_unit(auth.uid(), unit_id)) OR
    (public.has_role(auth.uid(), 'general_manager') AND unit_id IN (
      SELECT public.get_descendant_units(mu.unit_id) FROM public.manager_units mu WHERE mu.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update profiles in their scope"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.can_manage_unit(auth.uid(), unit_id))
  WITH CHECK (id = auth.uid() OR public.can_manage_unit(auth.uid(), unit_id));

-- =============================================
-- RLS POLICIES - USER_ROLES
-- =============================================

CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view user roles in their scope"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND public.can_manage_unit(auth.uid(), p.unit_id)
    )
  );

CREATE POLICY "Managers can insert user roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'general_manager') OR
    (public.has_role(auth.uid(), 'unit_manager') AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND public.can_manage_unit(auth.uid(), p.unit_id)
    ))
  );

CREATE POLICY "Managers can update user roles in their scope"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id AND public.can_manage_unit(auth.uid(), p.unit_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id AND public.can_manage_unit(auth.uid(), p.unit_id)
  ));

CREATE POLICY "Managers can delete user roles in their scope"
  ON public.user_roles FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id AND public.can_manage_unit(auth.uid(), p.unit_id)
  ));

-- =============================================
-- RLS POLICIES - MANAGER_UNITS
-- =============================================

CREATE POLICY "Users can view their managed units"
  ON public.manager_units FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "General managers can insert manager_units"
  ON public.manager_units FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'general_manager'));

CREATE POLICY "General managers can update manager_units"
  ON public.manager_units FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'general_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'general_manager'));

CREATE POLICY "General managers can delete manager_units"
  ON public.manager_units FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'general_manager'));

-- =============================================
-- RLS POLICIES - CUSTOMERS
-- =============================================

CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- RLS POLICIES - ORDERS
-- =============================================

CREATE POLICY "Users can view orders in their scope"
  ON public.orders FOR SELECT TO authenticated
  USING (public.can_access_order(auth.uid(), sales_id, unit_id));

CREATE POLICY "Sales can create orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (sales_id = auth.uid());

CREATE POLICY "Sales can update their own orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (sales_id = auth.uid())
  WITH CHECK (sales_id = auth.uid());

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
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
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
