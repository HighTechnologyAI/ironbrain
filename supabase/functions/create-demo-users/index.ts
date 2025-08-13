import { serve } from 'https://deno.land/std@0.220.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Демо сотрудники с реальными email и паролями
    const demoEmployees = [
      { email: 'alpay@hightechai.site', password: 'qwerty123', fullName: 'alpay' },
      { email: 'arbnika@hightechai.site', password: 'qwerty123', fullName: 'arbnika' },
      { email: 'ilo@hightechai.site', password: 'qwerty123', fullName: 'ilo' },
      { email: 'shevket@hightechai.site', password: 'qwerty123', fullName: 'shevket' },
      { email: 'dany@hightechai.site', password: 'qwerty123', fullName: 'dany' },
      { email: 'zhan@hightechai.site', password: 'qwerty123', fullName: 'zhan' },
      { email: 'o.k@hightechai.site', password: 'qwerty123', fullName: 'oleksandr' },
      { email: 'peter@hightechai.site', password: 'qwerty123', fullName: 'peter' }
    ]

    const createdUsers = []

    // Получаем существующие профили
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at')

    if (profilesError) {
      throw profilesError
    }

    // Создаем пользователей и связываем с профилями
    for (let i = 0; i < demoEmployees.length && i < profiles.length; i++) {
      const employee = demoEmployees[i]
      const profile = profiles[i]

      // Создаем пользователя
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: employee.email,
        password: employee.password,
        email_confirm: true,
        user_metadata: {
          full_name: employee.fullName
        }
      })

      if (authError) {
        console.error('Error creating user:', authError)
        continue
      }

      // Обновляем профиль
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          user_id: authUser.user.id,
          full_name: employee.fullName
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        continue
      }

      createdUsers.push({
        email: employee.email,
        password: employee.password,
        fullName: employee.fullName,
        profileId: profile.id
      })
    }

    return new Response(JSON.stringify({
      success: true,
      users: createdUsers,
      message: `Создано ${createdUsers.length} пользователей`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})