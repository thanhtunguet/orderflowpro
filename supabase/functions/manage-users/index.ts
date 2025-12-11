import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserPayload {
  action: 'create'
  email: string
  password: string
  full_name: string
  role: 'sales' | 'unit_manager' | 'general_manager'
  unit_id: string | null
}

interface UpdateUserPayload {
  action: 'update'
  user_id: string
  full_name?: string
  unit_id?: string | null
  role?: 'sales' | 'unit_manager' | 'general_manager'
}

interface DeleteUserPayload {
  action: 'delete'
  user_id: string
}

interface AssignManagerUnitsPayload {
  action: 'assign_manager_units'
  user_id: string
  unit_ids: string[]
}

type Payload = CreateUserPayload | UpdateUserPayload | DeleteUserPayload | AssignManagerUnitsPayload

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client for user management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get auth user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the requesting user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const { data: { user: requestingUser }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !requestingUser) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user has manager role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single()

    if (roleError || !userRole) {
      console.error('Role error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Không có quyền thực hiện thao tác này' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isManager = userRole.role === 'general_manager' || userRole.role === 'unit_manager'
    if (!isManager) {
      return new Response(
        JSON.stringify({ error: 'Chỉ quản lý mới có quyền thực hiện thao tác này' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: Payload = await req.json()
    console.log('Processing action:', payload.action)

    switch (payload.action) {
      case 'create': {
        const { email, password, full_name, role, unit_id } = payload

        // Only general_manager can create users
        if (userRole.role !== 'general_manager') {
          return new Response(
            JSON.stringify({ error: 'Chỉ quản lý chung mới có quyền tạo người dùng mới' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name }
        })

        if (createError) {
          console.error('Create user error:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update profile with unit_id if provided
        if (unit_id) {
          await supabaseAdmin
            .from('profiles')
            .update({ unit_id })
            .eq('id', newUser.user.id)
        }

        // Update role if not default sales
        if (role && role !== 'sales') {
          await supabaseAdmin
            .from('user_roles')
            .update({ role })
            .eq('user_id', newUser.user.id)
        }

        console.log('User created successfully:', newUser.user.id)
        return new Response(
          JSON.stringify({ success: true, user_id: newUser.user.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        const { user_id, full_name, unit_id, role } = payload

        // Update profile
        if (full_name !== undefined || unit_id !== undefined) {
          const updateData: Record<string, unknown> = {}
          if (full_name !== undefined) updateData.full_name = full_name
          if (unit_id !== undefined) updateData.unit_id = unit_id

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', user_id)

          if (profileError) {
            console.error('Profile update error:', profileError)
            return new Response(
              JSON.stringify({ error: profileError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        // Update role (only general_manager can change roles)
        if (role !== undefined) {
          if (userRole.role !== 'general_manager') {
            return new Response(
              JSON.stringify({ error: 'Chỉ quản lý chung mới có quyền thay đổi vai trò' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { error: roleUpdateError } = await supabaseAdmin
            .from('user_roles')
            .update({ role })
            .eq('user_id', user_id)

          if (roleUpdateError) {
            console.error('Role update error:', roleUpdateError)
            return new Response(
              JSON.stringify({ error: roleUpdateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        console.log('User updated successfully:', user_id)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { user_id } = payload

        // Only general_manager can delete users
        if (userRole.role !== 'general_manager') {
          return new Response(
            JSON.stringify({ error: 'Chỉ quản lý chung mới có quyền xóa người dùng' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Cannot delete yourself
        if (user_id === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: 'Không thể xóa chính mình' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete auth user (cascade will handle related data)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (deleteError) {
          console.error('Delete user error:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('User deleted successfully:', user_id)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'assign_manager_units': {
        const { user_id, unit_ids } = payload

        // Only general_manager can assign units
        if (userRole.role !== 'general_manager') {
          return new Response(
            JSON.stringify({ error: 'Chỉ quản lý chung mới có quyền phân công đơn vị' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete existing assignments
        const { error: deleteError } = await supabaseAdmin
          .from('manager_units')
          .delete()
          .eq('user_id', user_id)

        if (deleteError) {
          console.error('Delete manager units error:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Insert new assignments
        if (unit_ids.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('manager_units')
            .insert(unit_ids.map(unit_id => ({ user_id, unit_id })))

          if (insertError) {
            console.error('Insert manager units error:', insertError)
            return new Response(
              JSON.stringify({ error: insertError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        console.log('Manager units assigned successfully:', user_id, unit_ids)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
