import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  unit_id: string | null;
  created_at: string;
  updated_at: string;
  role: AppRole;
  unit?: {
    id: string;
    name: string;
    code: string;
  } | null;
  managedUnits?: {
    id: string;
    name: string;
    code: string;
  }[];
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Get profiles with their units
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          unit:units(id, name, code)
        `);

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Get manager_units for general managers
      const { data: managerUnits, error: muError } = await supabase
        .from('manager_units')
        .select(`
          user_id,
          unit:units(id, name, code)
        `);

      if (muError) throw muError;

      // Map roles to users
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));
      
      // Map managed units to users
      const managedUnitsMap = new Map<string, { id: string; name: string; code: string }[]>();
      managerUnits.forEach(mu => {
        const existing = managedUnitsMap.get(mu.user_id) || [];
        if (mu.unit) {
          existing.push(mu.unit);
        }
        managedUnitsMap.set(mu.user_id, existing);
      });

      return profiles.map(profile => ({
        ...profile,
        role: roleMap.get(profile.id) || 'sales',
        managedUnits: managedUnitsMap.get(profile.id) || [],
      }));
    },
  });
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}

export function useUnitsHierarchy() {
  return useQuery({
    queryKey: ['units-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}

interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
  unit_id: string | null;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: input.email,
          password: input.password,
          full_name: input.full_name,
          role: input.role,
          unit_id: input.unit_id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      toast.success('Đã tạo người dùng mới');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

interface UpdateUserInput {
  id: string;
  full_name?: string;
  unit_id?: string | null;
  role?: AppRole;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          user_id: input.id,
          full_name: input.full_name,
          unit_id: input.unit_id,
          role: input.role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      toast.success('Đã cập nhật thông tin người dùng');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          user_id: userId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      toast.success('Đã xóa người dùng');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

// Manage units for general managers
export function useAssignManagerUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, unitIds }: { userId: string; unitIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'assign_manager_units',
          user_id: userId,
          unit_ids: unitIds,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      toast.success('Đã cập nhật đơn vị quản lý');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
}

export function useUserStats() {
  const { data: users } = useUsers();

  const stats = {
    sales: users?.filter(u => u.role === 'sales').length || 0,
    unit_manager: users?.filter(u => u.role === 'unit_manager').length || 0,
    general_manager: users?.filter(u => u.role === 'general_manager').length || 0,
    total: users?.length || 0,
  };

  return stats;
}
