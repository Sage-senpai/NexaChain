// FILE 3: src/app/api/messages/[conversationId]/status/route.ts
// ============================================
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, verifyAdminAccess } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
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

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Use admin client to update status
    const adminClient = createAdminClient()
    
    const { data: conversation, error: updateError } = await adminClient
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}