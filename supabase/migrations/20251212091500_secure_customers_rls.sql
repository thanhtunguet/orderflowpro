-- Tighten customer access to territory/role scope and capture ownership

-- Ensure customers carry unit ownership and creator for scoped RLS
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Populate missing metadata on insert
CREATE OR REPLACE FUNCTION public.set_customer_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester uuid;
  requester_unit uuid;
BEGIN
  requester := COALESCE(auth.uid(), NEW.created_by);
  requester_unit := public.get_user_unit_id(requester);

  IF NEW.created_by IS NULL THEN
    NEW.created_by := requester;
  END IF;

  IF NEW.unit_id IS NULL THEN
    NEW.unit_id := requester_unit;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_customer_metadata_trigger ON public.customers;
CREATE TRIGGER set_customer_metadata_trigger
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_customer_metadata();

-- Replace overly permissive customer policies
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

-- View only customers in your territory or those you created
CREATE POLICY "Customers visible within managed units" ON public.customers
FOR SELECT TO authenticated
USING (
  -- Creator can always view
  created_by = auth.uid()
  OR
  -- Managers can view customers in units they oversee (includes descendants via can_manage_unit)
  (unit_id IS NOT NULL AND public.can_manage_unit(auth.uid(), unit_id))
  OR
  -- Sales can view customers tied to orders they are allowed to access
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.customer_id = customers.id
    AND public.can_access_order(auth.uid(), o.sales_id, o.unit_id)
  )
);

-- Insert only into your own unit or units you manage
CREATE POLICY "Create customers in managed units" ON public.customers
FOR INSERT TO authenticated
WITH CHECK (
  -- Enforce caller ownership
  (created_by IS NULL OR created_by = auth.uid())
  AND
  (
    -- If caller supplied a unit, they must manage it
    (unit_id IS NOT NULL AND public.can_manage_unit(auth.uid(), unit_id))
    OR
    -- Otherwise it will be stamped to the caller's unit
    (unit_id IS NULL AND public.get_user_unit_id(auth.uid()) IS NOT NULL)
  )
);

-- Update only customers you created or that sit in your managed territory
CREATE POLICY "Update customers in managed units" ON public.customers
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR (unit_id IS NOT NULL AND public.can_manage_unit(auth.uid(), unit_id))
)
WITH CHECK (
  created_by = auth.uid()
  OR (unit_id IS NOT NULL AND public.can_manage_unit(auth.uid(), unit_id))
);
