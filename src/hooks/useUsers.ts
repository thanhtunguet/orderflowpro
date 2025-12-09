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

      // Map roles to users
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

      return profiles.map(profile => ({
        ...profile,
        role: roleMap.get(profile.id) || 'sales',
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
      // Note: In production, user creation should be done via Edge Function 
      // with admin privileges. For now, we'll create the profile directly
      // assuming the user already exists or will be invited.
      
      // This is a simplified flow - in production you would:
      // 1. Create user via Supabase Admin API (edge function)
      // 2. The trigger will create profile and default role
      // 3. Then update the role if needed

      throw new Error('Tính năng tạo người dùng cần được implement qua Edge Function với quyền admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã tạo người dùng mới');
    },
    onError: (error) => {
      toast.error(error.message);
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
      const { id, role, ...profileData } = input;

      // Update profile if there are profile fields to update
      if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id);

        if (profileError) throw profileError;
      }

      // Update role if provided
      if (role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', id);

        if (roleError) throw roleError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã cập nhật thông tin người dùng');
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
