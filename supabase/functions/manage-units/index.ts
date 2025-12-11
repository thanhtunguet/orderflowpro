import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUnitPayload {
  action: 'create'
  name: string
  code: string
  parent_id: string | null
}

interface UpdateUnitPayload {
  action: 'update'
  unit_id: string
  name?: string
  code?: string
  parent_id?: string | null
}

interface DeleteUnitPayload {
  action: 'delete'
  unit_id: string
}

interface AssignUnitManagerPayload {
  action: 'assign_manager'
  unit_id: string
  user_id: string | null
}

type Payload = CreateUnitPayload | UpdateUnitPayload | DeleteUnitPayload | AssignUnitManagerPayload

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client
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
        const { name, code, parent_id } = payload

        const { data: newUnit, error: createError } = await supabaseAdmin
          .from('units')
          .insert({ name, code, parent_id })
          .select()
          .single()

        if (createError) {
          console.error('Create unit error:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Unit created successfully:', newUnit.id)
        return new Response(
          JSON.stringify({ success: true, unit: newUnit }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        const { unit_id, name, code, parent_id } = payload

        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name
        if (code !== undefined) updateData.code = code
        if (parent_id !== undefined) updateData.parent_id = parent_id

        // Prevent circular reference
        if (parent_id === unit_id) {
          return new Response(
            JSON.stringify({ error: 'Đơn vị không thể là cha của chính nó' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedUnit, error: updateError } = await supabaseAdmin
          .from('units')
          .update(updateData)
          .eq('id', unit_id)
          .select()
          .single()

        if (updateError) {
          console.error('Update unit error:', updateError)
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Unit updated successfully:', unit_id)
        return new Response(
          JSON.stringify({ success: true, unit: updatedUnit }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { unit_id } = payload

        // Check if unit has children
        const { data: children, error: childrenError } = await supabaseAdmin
          .from('units')
          .select('id')
          .eq('parent_id', unit_id)

        if (childrenError) {
          console.error('Check children error:', childrenError)
          return new Response(
            JSON.stringify({ error: childrenError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (children && children.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Không thể xóa đơn vị có đơn vị con. Vui lòng xóa đơn vị con trước.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if unit has members
        const { data: members, error: membersError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('unit_id', unit_id)

        if (membersError) {
          console.error('Check members error:', membersError)
          return new Response(
            JSON.stringify({ error: membersError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (members && members.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Không thể xóa đơn vị có thành viên. Vui lòng chuyển thành viên trước.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Delete manager_units associations
        await supabaseAdmin
          .from('manager_units')
          .delete()
          .eq('unit_id', unit_id)

        // Delete unit
        const { error: deleteError } = await supabaseAdmin
          .from('units')
          .delete()
          .eq('id', unit_id)

        if (deleteError) {
          console.error('Delete unit error:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Unit deleted successfully:', unit_id)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'assign_manager': {
        const { unit_id, user_id } = payload

        if (user_id) {
          // Update the user's unit_id and role
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ unit_id })
            .eq('id', user_id)

          if (profileError) {
            console.error('Update profile error:', profileError)
            return new Response(
              JSON.stringify({ error: profileError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Set user role to unit_manager
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .update({ role: 'unit_manager' })
            .eq('user_id', user_id)

          if (roleError) {
            console.error('Update role error:', roleError)
            return new Response(
              JSON.stringify({ error: roleError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        console.log('Manager assigned successfully:', unit_id, user_id)
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
