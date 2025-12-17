// src/app/api/messages/[conversationId]/status/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { conversationId } = await params // Await the params Promise
    const body = await request.json()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Update conversation status
    const { data: conversation, error: updateError } = await supabase
      .from('conversations')
      .update({ 
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select(`
        *,
        profiles!conversations_user_id_fkey(full_name, email)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Handle profiles array properly
    const profileData = Array.isArray(conversation.profiles) 
      ? conversation.profiles[0] 
      : conversation.profiles

    return NextResponse.json({
      conversation: {
        ...conversation,
        user_name: profileData?.full_name || "Unknown User",
        user_email: profileData?.email || "",
      }
    })

  } catch (error) {
    console.error('Error updating conversation status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}