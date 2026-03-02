import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { FileText, CheckCircle } from 'lucide-react'
import type { Proposal, LineItem } from '@/lib/types'
import ClientAcceptance from '@/components/client-acceptance'

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createAdminClient()

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!proposal) notFound()

  const p = proposal as Proposal

  // Record view
  await supabase.from('proposal_views').insert({
    proposal_id: p.id,
    viewed_at: new Date().toISOString(),
  })

  // Update status to viewed if it was just sent
  if (p.status === 'sent') {
    await supabase
      .from('proposals')
      .update({ status: 'viewed', viewed_at: new Date().toISOString() })
      .eq('id', p.id)
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, brand_color')
    .eq('id', p.user_id)
    .single()

  const { data: lineItems } = await supabase
    .from('line_items')
    .select('*')
    .eq('proposal_id', p.id)
    .order('sort_order')

  const items = (lineItems || []) as LineItem[]
  const brandColor = profile?.brand_color || '#7c3aed'
  const senderName = profile?.company_name || profile?.full_name || 'Your Vendor'
  const isActive = p.status !== 'accepted' && p.status !== 'declined' && p.status !== 'expired'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="py-4 px-6" style={{ backgroundColor: brandColor }}>
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <FileText className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">{senderName}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Status banner */}
        {p.status === 'accepted' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-900">Proposal Accepted</div>
              <div className="text-green-700 text-sm">You accepted this proposal. {senderName} has been notified.</div>
            </div>
          </div>
        )}
        {p.status === 'declined' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="font-semibold text-red-900">Proposal Declined</div>
            <div className="text-red-700 text-sm">You declined this proposal.</div>
          </div>
        )}

        {/* Proposal header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{p.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>Prepared for: <strong className="text-gray-900">{p.client_name}</strong>{p.client_company ? ` · ${p.client_company}` : ''}</span>
            {p.valid_until && (
              <span>Valid until: <strong className="text-gray-900">{format(new Date(p.valid_until), 'MMMM d, yyyy')}</strong></span>
            )}
          </div>
          {p.intro_message && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{p.intro_message}</p>
          )}
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="font-bold text-gray-900 text-xl mb-6">Scope of Work</h2>
          <div className="space-y-0">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 uppercase pb-3 border-b border-gray-100">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 py-4 border-b border-gray-50">
                <div className="col-span-6 text-gray-900 font-medium">{item.description}</div>
                <div className="col-span-2 text-right text-gray-500">{item.quantity}</div>
                <div className="col-span-2 text-right text-gray-500">{formatCurrency(item.unit_price, p.currency)}</div>
                <div className="col-span-2 text-right font-semibold text-gray-900">{formatCurrency(item.subtotal, p.currency)}</div>
              </div>
            ))}
            <div className="flex justify-end pt-6">
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Investment</div>
                <div className="text-4xl font-bold text-gray-900">{formatCurrency(p.total_amount, p.currency)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {p.notes && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
            <h2 className="font-bold text-gray-900 mb-3">Notes</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{p.notes}</p>
          </div>
        )}

        {/* Terms */}
        {p.terms && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
            <h2 className="font-bold text-gray-900 mb-3">Terms & Conditions</h2>
            <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{p.terms}</p>
          </div>
        )}

        {/* Acceptance buttons */}
        {isActive && (
          <ClientAcceptance proposalId={p.id} clientName={p.client_name} brandColor={brandColor} />
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by ProposalFlow
        </p>
      </div>
    </div>
  )
}
