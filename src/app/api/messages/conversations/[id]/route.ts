// src/app/api/messages/conversations/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params // Await the params Promise

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Get conversation with messages
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_user_id_fkey(full_name, email),
        messages(*)
      `)
      .eq('id', id)
      .single()

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check authorization
    const isAdmin = profile?.role === 'admin'
    const isOwner = conversation.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get messages ordered by created_at
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    // Format response - handle profiles array properly
    const profileData = Array.isArray(conversation.profiles) 
      ? conversation.profiles[0] 
      : conversation.profiles

    return NextResponse.json({
      conversation: {
        ...conversation,
        user_name: profileData?.full_name || profileData?.email || "Unknown User",
        user_email: profileData?.email || "",
      },
      messages: messages || []
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}