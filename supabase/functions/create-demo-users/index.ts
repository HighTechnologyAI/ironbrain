import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    // Демо сотрудники
    const demoEmployees = [
      { email: 'anna.petrova@company.com', password: 'Demo123!', fullName: 'Анна Петрова' },
      { email: 'dmitry.sidorov@company.com', password: 'Demo123!', fullName: 'Дмитрий Сидоров' },
      { email: 'elena.kozlova@company.com', password: 'Demo123!', fullName: 'Елена Козлова' },
      { email: 'mikhail.volkov@company.com', password: 'Demo123!', fullName: 'Михаил Волков' },
      { email: 'olga.morozova@company.com', password: 'Demo123!', fullName: 'Ольга Морозова' },
      { email: 'sergey.petrov@company.com', password: 'Demo123!', fullName: 'Сергей Петров' },
      { email: 'tatyana.ivanova@company.com', password: 'Demo123!', fullName: 'Татьяна Иванова' },
      { email: 'vladimir.kuznetsov@company.com', password: 'Demo123!', fullName: 'Владимир Кузнецов' },
      { email: 'yulia.novikova@company.com', password: 'Demo123!', fullName: 'Юлия Новикова' }
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