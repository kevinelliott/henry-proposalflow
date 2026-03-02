'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  proposalId: string
  clientName: string
  brandColor: string
}

export default function ClientAcceptance({ proposalId, clientName, brandColor }: Props) {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null)
  const supabase = createClient()

  async function handleDecision(decision: 'accepted' | 'declined') {
    setLoading(decision === 'accepted' ? 'accept' : 'decline')
    const now = new Date().toISOString()
    await supabase
      .from('proposals')
      .update({
        status: decision,
        accepted_at: decision === 'accepted' ? now : null,
        declined_at: decision === 'declined' ? now : null,
      })
      .eq('id', proposalId)

    // Cancel follow-ups
    await supabase
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('proposal_id', proposalId)
      .eq('status', 'pending')

    setDone(decision)
    setLoading(null)
  }

  if (done === 'accepted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-900 mb-2">Proposal Accepted!</h3>
        <p className="text-green-700">Thank you, {clientName}. We&apos;ll be in touch shortly to get started.</p>
      </div>
    )
  }

  if (done === 'declined') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <XCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Proposal Declined</h3>
        <p className="text-gray-500 text-sm">Thank you for letting us know.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to move forward?</h3>
      <p className="text-gray-500 text-sm mb-8">
        By accepting, you agree to the terms and conditions outlined above.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleDecision('declined')}
          disabled={!!loading}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          {loading === 'decline' ? 'Declining...' : 'Decline'}
        </button>
        <button
          onClick={() => handleDecision('accepted')}
          disabled={!!loading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          <CheckCircle className="w-4 h-4" />
          {loading === 'accept' ? 'Accepting...' : 'Accept Proposal'}
        </button>
      </div>
    </div>
  )
}
