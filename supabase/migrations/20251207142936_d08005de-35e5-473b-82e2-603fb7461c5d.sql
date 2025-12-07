
-- Create enums for roles and customer sources
CREATE TYPE public.app_role AS ENUM ('sales', 'unit_manager', 'general_manager');
CREATE TYPE public.customer_source AS ENUM (
  'hotline',
  'facebook_ads', 
  'zalo_oa',
  'walkin',
  'referral',
  'returning_with_ads',
  'returning_without_ads'
);
CREATE TYPE public.customer_type AS ENUM ('new', 'returning');

-- Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table (references auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  unit_id UUID REFERENCES public.units(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'sales',
  UNIQUE(user_id, role)
);

-- Create manager_units junction table (for managers assigned to multiple units)
CREATE TABLE public.manager_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  name TEXT,
  first_order_source public.customer_source,
  first_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on phone for quick lookup
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_source public.customer_source NOT NULL,
  customer_type public.customer_type NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  notes TEXT,
  sales_id UUID NOT NULL REFERENCES auth.users(id),
  unit_id UUID NOT NULL REFERENCES public.units(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_orders_sales_id ON public.orders(sales_id);
CREATE INDEX idx_orders_unit_id ON public.orders(unit_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);

-- Enable RLS on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
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

-- Security definer function to get user's unit_id
CREATE OR REPLACE FUNCTION public.get_user_unit_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.profiles WHERE id = _user_id
$$;

-- Security definer function to check if user manages a unit
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

-- Security definer function to check order access
CREATE OR REPLACE FUNCTION public.can_access_order(_user_id UUID, _order_sales_id UUID, _order_unit_id UUID)
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

-- RLS Policies for units (everyone authenticated can view)
CREATE POLICY "Authenticated users can view units"
  ON public.units FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Managers can view profiles in their scope"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'unit_manager') AND unit_id = public.get_user_unit_id(auth.uid())
    OR
    public.has_role(auth.uid(), 'general_manager') AND public.manages_unit(auth.uid(), unit_id)
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles (users can view their own role)
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for manager_units
CREATE POLICY "Users can view their managed units"
  ON public.manager_units FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for customers (based on order access)
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

-- RLS Policies for orders
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

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
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

-- Function to handle new user registration
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

-- Trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- Trigger for auto-generating order number
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
