import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { FileText, Eye, CheckCircle, XCircle, Clock, Plus, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Proposal } from '@/lib/types'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const all = (proposals || []) as Proposal[]
  const sent = all.filter(p => p.status !== 'draft').length
  const accepted = all.filter(p => p.status === 'accepted').length
  const pending = all.filter(p => p.status === 'sent' || p.status === 'viewed').length
  const totalValue = all.filter(p => p.status === 'accepted').reduce((s, p) => s + p.total_amount, 0)
  const winRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your proposals</p>
        </div>
        <Link
          href="/proposals/new"
          className="flex items-center gap-2 bg-violet-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Proposals', value: all.length, icon: FileText, color: 'text-violet-600 bg-violet-50' },
          { label: 'Pending Response', value: pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Revenue Won', value: formatCurrency(totalValue), icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Proposals list */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Proposals</h2>
          <span className="text-sm text-gray-400">{all.length} total</span>
        </div>
        {all.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No proposals yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create your first proposal and start winning deals.</p>
            <Link
              href="/proposals/new"
              className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create proposal
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {all.map((proposal) => {
              const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft
              return (
                <Link
                  key={proposal.id}
                  href={`/proposals/${proposal.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{proposal.title}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-gray-500 truncate">{proposal.client_name}</span>
                      {proposal.client_company && (
                        <span className="text-sm text-gray-400">· {proposal.client_company}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">{formatCurrency(proposal.total_amount)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
