'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, CreditCard, Zap } from 'lucide-react'

export default function BillingPage() {
  const supabase = createClient()
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
      setSubStatus(data?.subscription_status || null)
    }
    load()
  }, [supabase])

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  async function handlePortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  const isActive = subStatus === 'active' || subStatus === 'trialing'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your ProposalFlow subscription</p>
      </div>

      {isActive ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Pro Plan — Active</div>
              <div className="text-sm text-gray-500">$49/month · All features included</div>
            </div>
          </div>
          <button
            onClick={handlePortal}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? 'Loading...' : 'Manage Billing'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-violet-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Upgrade to Pro</div>
              <div className="text-sm text-gray-500">14-day free trial, then $49/month</div>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {[
              'Unlimited proposals',
              'View tracking & real-time notifications',
              'Automated follow-up sequences',
              'Client acceptance portal',
              'Custom branding',
            ].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Start Free Trial'}
          </button>
        </div>
      )}
    </div>
  )
}
