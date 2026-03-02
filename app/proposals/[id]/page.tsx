import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import { ArrowLeft, Eye, Copy, CheckCircle, Clock, XCircle, Send, FileText, ExternalLink } from 'lucide-react'
import type { Proposal, LineItem, FollowUp } from '@/lib/types'
import CopyButton from '@/components/copy-button'
import ProposalActions from '@/components/proposal-actions'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: Clock },
}

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) notFound()

  const [{ data: lineItems }, { data: views }, { data: followUps }] = await Promise.all([
    supabase.from('line_items').select('*').eq('proposal_id', id).order('sort_order'),
    supabase.from('proposal_views').select('*').eq('proposal_id', id).order('viewed_at', { ascending: false }),
    supabase.from('follow_ups').select('*').eq('proposal_id', id).order('scheduled_for'),
  ])

  const p = proposal as Proposal
  const items = (lineItems || []) as LineItem[]
  const allViews = (views || []) as { viewed_at: string }[]
  const followUpList = (followUps || []) as FollowUp[]
  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft
  const StatusIcon = statusCfg.icon
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://henry-proposalflow.vercel.app'
  const publicUrl = `${appUrl}/p/${p.public_token}`

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
            <span className="text-gray-400 text-sm">
              {p.client_name} {p.client_company ? `· ${p.client_company}` : ''}
            </span>
          </div>
        </div>
        <ProposalActions proposal={p} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Client link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">Client Proposal Link</h3>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-xs text-gray-600 truncate">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
            <div className="space-y-0">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 uppercase pb-2 border-b border-gray-100">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 py-3 border-b border-gray-50 text-sm">
                  <div className="col-span-6 text-gray-900">{item.description}</div>
                  <div className="col-span-2 text-right text-gray-500">{item.quantity}</div>
                  <div className="col-span-2 text-right text-gray-500">{formatCurrency(item.unit_price)}</div>
                  <div className="col-span-2 text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(p.total_amount)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(p.notes || p.terms) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              {p.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-500 text-sm whitespace-pre-wrap">{p.notes}</p>
                </div>
              )}
              {p.terms && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                  <p className="text-gray-500 text-sm whitespace-pre-wrap">{p.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Created', date: p.created_at },
                { label: 'Sent', date: p.sent_at },
                { label: 'First Viewed', date: p.viewed_at },
                { label: 'Accepted', date: p.accepted_at },
                { label: 'Declined', date: p.declined_at },
              ].map((event) => event.date && (
                <div key={event.label} className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-500">{event.label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right">
                    {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                  </span>
                </div>
              ))}
              {p.valid_until && (
                <div className="flex items-start justify-between gap-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Expires</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(p.valid_until), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Views */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Views</h3>
              <span className="text-sm font-bold text-violet-600">{allViews.length}</span>
            </div>
            {allViews.length === 0 ? (
              <p className="text-gray-400 text-xs">Not viewed yet</p>
            ) : (
              <div className="space-y-2">
                {allViews.slice(0, 5).map((v, i) => (
                  <div key={i} className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(v.viewed_at), { addSuffix: true })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Auto Follow-ups</h3>
            {followUpList.length === 0 ? (
              <p className="text-gray-400 text-xs">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-3">
                {followUpList.map((fu) => (
                  <div key={fu.id} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      fu.status === 'sent' ? 'bg-green-400' :
                      fu.status === 'cancelled' ? 'bg-gray-300' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <div className="text-xs font-medium text-gray-700">{fu.subject}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fu.status === 'sent' ? 'Sent' : fu.status === 'cancelled' ? 'Cancelled' : 'Scheduled for'}{' '}
                        {formatDistanceToNow(new Date(fu.scheduled_for), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
