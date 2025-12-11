import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AppRole = Database['public']['Enums']['app_role'];

export interface UnitWithHierarchy {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  children: UnitWithHierarchy[];
  manager?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  members: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: AppRole;
  }[];
  level: number;
}

export function useOrganizationTree() {
  return useQuery({
    queryKey: ['organization-tree'],
    queryFn: async (): Promise<{
      generalManagers: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        managedUnitIds: string[];
      }[];
      units: UnitWithHierarchy[];
    }> => {
      // Fetch all units
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (unitsError) throw unitsError;

      // Fetch all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch manager_units to know which units each general manager manages
      const { data: managerUnits, error: muError } = await supabase
        .from('manager_units')
        .select('*');

      if (muError) throw muError;

      // Create role map
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

      // Get general managers
      const generalManagerIds = roles
        .filter(r => r.role === 'general_manager')
        .map(r => r.user_id);

      const generalManagers = profiles
        .filter(p => generalManagerIds.includes(p.id))
        .map(p => ({
          ...p,
          managedUnitIds: managerUnits
            .filter(mu => mu.user_id === p.id)
            .map(mu => mu.unit_id),
        }));

      // Get unit managers (unit_manager role with unit_id)
      const unitManagerIds = roles
        .filter(r => r.role === 'unit_manager')
        .map(r => r.user_id);

      // Build unit hierarchy
      const buildHierarchy = (parentId: string | null, level: number): UnitWithHierarchy[] => {
        return units
          .filter(u => u.parent_id === parentId)
          .map(unit => {
            // Find manager for this unit (unit_manager with matching unit_id)
            const manager = profiles.find(
              p => p.unit_id === unit.id && unitManagerIds.includes(p.id)
            );

            // Find members for this unit (all profiles with matching unit_id)
            const members = profiles
              .filter(p => p.unit_id === unit.id)
              .map(p => ({
                ...p,
                role: roleMap.get(p.id) || 'sales' as AppRole,
              }));

            return {
              ...unit,
              children: buildHierarchy(unit.id, level + 1),
              manager: manager ? {
                id: manager.id,
                full_name: manager.full_name,
                email: manager.email,
                avatar_url: manager.avatar_url,
              } : null,
              members,
              level,
            };
          });
      };

      const rootUnits = buildHierarchy(null, 0);

      return {
        generalManagers,
        units: rootUnits,
      };
    },
  });
}

interface CreateUnitInput {
  name: string;
  code: string;
  parent_id?: string | null;
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUnitInput) => {
      const { data, error } = await supabase.functions.invoke('manage-units', {
        body: {
          action: 'create',
          name: input.name,
          code: input.code,
          parent_id: input.parent_id || null,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Đã tạo đơn vị mới');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

interface UpdateUnitInput {
  id: string;
  name?: string;
  code?: string;
  parent_id?: string | null;
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUnitInput) => {
      const { data, error } = await supabase.functions.invoke('manage-units', {
        body: {
          action: 'update',
          unit_id: input.id,
          name: input.name,
          code: input.code,
          parent_id: input.parent_id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Đã cập nhật đơn vị');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unitId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-units', {
        body: {
          action: 'delete',
          unit_id: unitId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Đã xóa đơn vị');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useAssignUnitManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ unitId, userId }: { unitId: string; userId: string | null }) => {
      const { data, error } = await supabase.functions.invoke('manage-units', {
        body: {
          action: 'assign_manager',
          unit_id: unitId,
          user_id: userId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã phân công quản lý đơn vị');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useOrganizationStats() {
  const { data } = useOrganizationTree();

  const countMembers = (units: UnitWithHierarchy[]): number => {
    return units.reduce((acc, unit) => {
      return acc + unit.members.length + countMembers(unit.children);
    }, 0);
  };

  const countUnits = (units: UnitWithHierarchy[]): number => {
    return units.reduce((acc, unit) => {
      return acc + 1 + countUnits(unit.children);
    }, 0);
  };

  const countManagers = (units: UnitWithHierarchy[]): number => {
    return units.reduce((acc, unit) => {
      return acc + (unit.manager ? 1 : 0) + countManagers(unit.children);
    }, 0);
  };

  return {
    generalManagers: data?.generalManagers.length || 0,
    units: data ? countUnits(data.units) : 0,
    unitManagers: data ? countManagers(data.units) : 0,
    salesStaff: data ? countMembers(data.units) - countManagers(data.units) : 0,
    totalMembers: data ? countMembers(data.units) : 0,
  };
}
