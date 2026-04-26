import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key for server-side operations
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// User profile operations
export async function getUserProfile(userId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // If user profile doesn't exist, create it automatically
    if (error.code === 'PGRST116') {
      console.log('User profile not found, creating one...')
      return await initializeUserProfile(userId)
    }
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// Auto-create user profile
async function initializeUserProfile(userId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      user_type: 'student',
      tone_mode: 'balanced',
      language: 'en',
      streak_count: 0,
      xp_points: 0,
      user_level: 'Beginner',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  console.log('User profile created successfully')
  return data
}

// Usage tracking operations
export async function getUserUsage(userId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching user usage:', error)
    return null
  }

  return data
}

export async function initializeUsage(userId: string) {
  const supabase = createAdminClient()
  const today = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('user_usage')
    .insert({
      user_id: userId,
      chats_today: 0,
      last_chat_date: today,
      exams_this_month: 0,
      validations_this_month: 0,
      writes_this_month: 0,
      last_reset_date: today,
    })
    .select()
    .single()

  if (error) {
    console.error('Error initializing usage:', error)
    return null
  }

  return data
}

export async function updateChatUsage(userId: string, chatsToday: number) {
  const supabase = createAdminClient()
  const today = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('user_usage')
    .upsert({
      user_id: userId,
      chats_today: chatsToday,
      last_chat_date: today,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error updating chat usage:', error)
    return null
  }

  return data
}

// Subscription operations
export async function getUserSubscription(userId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

// Conversation operations
export async function getConversation(conversationId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (error) {
    console.error('Error fetching conversation:', error)
    return null
  }

  return data
}

export async function saveConversation(userId: string, title: string, messages: any[], mode: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title,
      messages,
      mode,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving conversation:', error)
    return null
  }

  return data
}

export async function updateConversation(conversationId: string, messages: any[]) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    return null
  }

  return data
}
