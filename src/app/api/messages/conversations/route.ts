// src/app/api/messages/conversations/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GET - Fetch all conversations for current user
// ============================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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

    const isAdmin = profile?.role === 'admin'

    // Fetch conversations based on role
    let query = supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_user_id_fkey(full_name, email, phone),
        messages(created_at, content, sender_role)
      `)
      .order('updated_at', { ascending: false })

    // If not admin, only show user's own conversations
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: conversations, error: convError } = await query

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    // Format conversations with last message
    const formattedConversations = conversations?.map(conv => {
      const profileData = Array.isArray(conv.profiles) 
        ? conv.profiles[0] 
        : conv.profiles

      const messages = Array.isArray(conv.messages) ? conv.messages : []
      const lastMessage = messages.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      return {
        id: conv.id,
        user_id: conv.user_id,
        user_name: profileData?.full_name || profileData?.email || "Unknown User",
        user_email: profileData?.email || "",
        subject: conv.subject,
        status: conv.status,
        last_message: lastMessage?.content || "",
        last_message_at: lastMessage?.created_at || conv.created_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }
    }) || []

    return NextResponse.json({ conversations: formattedConversations })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create new conversation with first message
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { subject, content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        subject: subject?.trim() || 'Support Request',
        status: 'open',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json(
        { error: convError.message },
        { status: 500 }
      )
    }

    // Create first message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        sender_role: 'user',
        content: content.trim()
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      // Try to clean up the conversation
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id)
      
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversation,
      message
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}