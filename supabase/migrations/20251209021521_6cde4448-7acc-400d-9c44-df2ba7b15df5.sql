-- Add parent_id to units table for hierarchical structure (unlimited levels)
ALTER TABLE public.units ADD COLUMN parent_id uuid REFERENCES public.units(id) ON DELETE SET NULL;

-- Create index for faster hierarchical queries
CREATE INDEX idx_units_parent_id ON public.units(parent_id);

-- Function to get all descendant units of a unit (recursive)
CREATE OR REPLACE FUNCTION public.get_descendant_units(_unit_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE unit_tree AS (
    SELECT id FROM public.units WHERE id = _unit_id
    UNION ALL
    SELECT u.id FROM public.units u
    INNER JOIN unit_tree ut ON u.parent_id = ut.id
  )
  SELECT id FROM unit_tree WHERE id != _unit_id
$$;

-- Function to get all ancestor units of a unit (recursive)
CREATE OR REPLACE FUNCTION public.get_ancestor_units(_unit_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE unit_tree AS (
    SELECT id, parent_id FROM public.units WHERE id = _unit_id
    UNION ALL
    SELECT u.id, u.parent_id FROM public.units u
    INNER JOIN unit_tree ut ON u.id = ut.parent_id
  )
  SELECT id FROM unit_tree WHERE id != _unit_id
$$;

-- Function to check if user can manage a unit (including descendant units)
CREATE OR REPLACE FUNCTION public.can_manage_unit(_user_id uuid, _unit_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- General manager can manage all assigned units and their descendants
    (public.has_role(_user_id, 'general_manager') AND (
      public.manages_unit(_user_id, _unit_id) OR
      EXISTS (
        SELECT 1 FROM public.manager_units mu
        WHERE mu.user_id = _user_id
        AND _unit_id IN (SELECT public.get_descendant_units(mu.unit_id))
      )
    ))
    OR
    -- Unit manager can manage their own unit and descendants
    (public.has_role(_user_id, 'unit_manager') AND (
      public.get_user_unit_id(_user_id) = _unit_id OR
      _unit_id IN (SELECT public.get_descendant_units(public.get_user_unit_id(_user_id)))
    ))
$$;

-- Update RLS policy for units to allow managers to manage their units
CREATE POLICY "Managers can insert units" ON public.units
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'general_manager') OR
  public.has_role(auth.uid(), 'unit_manager')
);

CREATE POLICY "Managers can update their units" ON public.units
FOR UPDATE TO authenticated
USING (public.can_manage_unit(auth.uid(), id))
WITH CHECK (public.can_manage_unit(auth.uid(), id));

CREATE POLICY "Managers can delete their units" ON public.units
FOR DELETE TO authenticated
USING (public.can_manage_unit(auth.uid(), id));

-- Update profiles RLS to allow managers to update profiles in their scope
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update profiles in their scope" ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = auth.uid() OR
  public.can_manage_unit(auth.uid(), unit_id)
)
WITH CHECK (
  id = auth.uid() OR
  public.can_manage_unit(auth.uid(), unit_id)
);

-- Allow managers to view all profiles in their managed units
DROP POLICY IF EXISTS "Managers can view profiles in their scope" ON public.profiles;

CREATE POLICY "Managers can view profiles in their scope" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR
  (public.has_role(auth.uid(), 'unit_manager') AND unit_id = public.get_user_unit_id(auth.uid())) OR
  (public.has_role(auth.uid(), 'unit_manager') AND unit_id IN (SELECT public.get_descendant_units(public.get_user_unit_id(auth.uid())))) OR
  (public.has_role(auth.uid(), 'general_manager') AND public.manages_unit(auth.uid(), unit_id)) OR
  (public.has_role(auth.uid(), 'general_manager') AND unit_id IN (
    SELECT public.get_descendant_units(mu.unit_id) FROM public.manager_units mu WHERE mu.user_id = auth.uid()
  ))
);

-- Allow managers to manage user_roles for users in their scope
CREATE POLICY "Managers can view user roles in their scope" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND public.can_manage_unit(auth.uid(), p.unit_id)
  )
);

CREATE POLICY "Managers can insert user roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'general_manager') OR
  (public.has_role(auth.uid(), 'unit_manager') AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND public.can_manage_unit(auth.uid(), p.unit_id)
  ))
);

CREATE POLICY "Managers can update user roles in their scope" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND public.can_manage_unit(auth.uid(), p.unit_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND public.can_manage_unit(auth.uid(), p.unit_id)
  )
);

CREATE POLICY "Managers can delete user roles in their scope" ON public.user_roles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND public.can_manage_unit(auth.uid(), p.unit_id)
  )
);

-- Allow managers to manage manager_units
CREATE POLICY "General managers can insert manager_units" ON public.manager_units
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'general_manager'));

CREATE POLICY "General managers can update manager_units" ON public.manager_units
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'general_manager'))
WITH CHECK (public.has_role(auth.uid(), 'general_manager'));

CREATE POLICY "General managers can delete manager_units" ON public.manager_units
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'general_manager'));