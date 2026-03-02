import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()

  // Get all pending follow-ups that are due
  const { data: followUps } = await supabase
    .from('follow_ups')
    .select('*, proposals(client_name, client_email, status, title, public_token)')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  if (!followUps || followUps.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const fu of followUps) {
    const proposal = fu.proposals as { client_name: string; client_email: string; status: string; title: string; public_token: string } | null
    if (!proposal) continue

    // Only send if proposal is still pending (not accepted/declined)
    if (proposal.status === 'accepted' || proposal.status === 'declined') {
      await supabase.from('follow_ups').update({ status: 'cancelled' }).eq('id', fu.id)
      continue
    }

    // In production, send email via Resend/SendGrid here
    // For now, mark as sent and log
    console.log(`[follow-up] Would send to ${proposal.client_email}: ${fu.subject}`)

    await supabase.from('follow_ups').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    }).eq('id', fu.id)

    processed++
  }

  return NextResponse.json({ processed })
}
