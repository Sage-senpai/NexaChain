// FILE 2: src/app/api/messages/[conversationId]/route.ts
// ============================================
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, verifyAdminAccess } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { conversationId } = await params

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminAccess(user.id)

    let conversation, messages;

    if (isAdmin) {
      // Admin: Use admin client
      const adminClient = createAdminClient()
      
      const { data: convData, error: convError } = await adminClient
        .from('conversations')
        .select(`
          *,
          profiles!conversations_user_id_fkey(full_name, email, phone)
        `)
        .eq('id', conversationId)
        .single()

      if (convError || !convData) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const { data: messagesData, error: messagesError } = await adminClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        return NextResponse.json({ error: messagesError.message }, { status: 500 })
      }

      conversation = convData
      messages = messagesData
    } else {
      // Regular user: Use regular client
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles!conversations_user_id_fkey(full_name, email, phone)
        `)
        .eq('id', conversationId)
        .eq('user_id', user.id) // RLS ensures this
        .single()

      if (convError || !convData) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        return NextResponse.json({ error: messagesError.message }, { status: 500 })
      }

      conversation = convData
      messages = messagesData
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient()
    const { conversationId } = await params
    const body = await request.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminAccess(user.id)

    // Validate content
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify conversation access
    if (isAdmin) {
      const adminClient = createAdminClient()
      const { data: conv } = await adminClient
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .single()

      if (!conv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    } else {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!conv) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_role: isAdmin ? 'admin' : 'user',
        content: body.content.trim()
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    // Update conversation
    await supabase
      .from('conversations')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}