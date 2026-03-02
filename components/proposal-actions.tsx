'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Proposal } from '@/lib/types'
import { Send, Trash2 } from 'lucide-react'

export default function ProposalActions({ proposal }: { proposal: Proposal }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSend() {
    setLoading(true)
    await supabase
      .from('proposals')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', proposal.id)

    // Schedule follow-ups
    const followUps = [
      { days: 3, subject: `Following up on your proposal: ${proposal.title}` },
      { days: 7, subject: `Still interested? ${proposal.title}` },
    ]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://henry-proposalflow.vercel.app'
    const followUpItems = followUps.map(fu => ({
      proposal_id: proposal.id,
      scheduled_for: new Date(Date.now() + fu.days * 86400000).toISOString(),
      status: 'pending',
      subject: fu.subject,
      body: `Hi ${proposal.client_name},\n\nJust following up on the proposal I sent you for "${proposal.title}". Please let me know if you have any questions or if you'd like to discuss further.\n\nYou can view the proposal here: ${appUrl}/p/${proposal.public_token}`,
    }))
    await supabase.from('follow_ups').insert(followUpItems)

    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this proposal? This cannot be undone.')) return
    setLoading(true)
    await supabase.from('proposals').delete().eq('id', proposal.id)
    router.push('/dashboard')
  }

  return (
    <div className="flex items-center gap-2">
      {proposal.status === 'draft' && (
        <button
          onClick={handleSend}
          disabled={loading}
          className="flex items-center gap-2 bg-violet-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors text-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Send Proposal'}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
