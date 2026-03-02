'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export default function NewProposalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_company: '',
    intro_message: '',
    valid_until: '',
    currency: 'USD',
    notes: '',
    terms: 'Payment is due within 30 days of acceptance. By accepting this proposal, you agree to these terms.',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ])

  function updateField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function updateLineItem(idx: number, key: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item))
  }

  function addLineItem() {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  }

  function removeLineItem(idx: number) {
    setLineItems(prev => prev.filter((_, i) => i !== idx))
  }

  const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  async function handleSave(status: 'draft' | 'sent') {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

      const { data: proposal, error: pErr } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          ...form,
          status,
          public_token: token,
          total_amount: total,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (pErr) throw pErr

      if (lineItems.length > 0) {
        const items = lineItems.map((item, i) => ({
          proposal_id: proposal.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
          sort_order: i,
        }))
        const { error: liErr } = await supabase.from('line_items').insert(items)
        if (liErr) throw liErr
      }

      if (status === 'sent') {
        // Schedule follow-up emails
        const followUps = [
          { days: 3, subject: `Following up on your proposal: ${form.title}` },
          { days: 7, subject: `Still interested? ${form.title}` },
        ]
        const followUpItems = followUps.map(fu => ({
          proposal_id: proposal.id,
          scheduled_for: new Date(Date.now() + fu.days * 86400000).toISOString(),
          status: 'pending',
          subject: fu.subject,
          body: `Hi ${form.client_name},\n\nJust following up on the proposal I sent you for "${form.title}". Please let me know if you have any questions or if you'd like to discuss further.\n\nYou can view the proposal here: ${process.env.NEXT_PUBLIC_APP_URL}/p/${token}`,
        }))
        await supabase.from('follow_ups').insert(followUpItems)
      }

      router.push(`/proposals/${proposal.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save proposal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Proposal</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create a proposal and send it to your client</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-6">{error}</p>}

      <div className="space-y-6">
        {/* Proposal title */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Proposal Details</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="e.g. Website Redesign for Acme Corp"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Introduction (shown to client)</label>
              <textarea
                value={form.intro_message}
                onChange={e => updateField('intro_message', e.target.value)}
                rows={3}
                placeholder="Thank you for considering us. Here's our proposal for your project..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={form.client_name}
                onChange={e => updateField('client_name', e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email *</label>
              <input
                type="email"
                value={form.client_email}
                onChange={e => updateField('client_email', e.target.value)}
                placeholder="jane@acmecorp.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={form.client_company}
                onChange={e => updateField('client_company', e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => updateField('valid_until', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Line Items</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Unit Price</div>
              <div className="col-span-1"></div>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                    placeholder="Design & Development"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-right"
                  />
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={e => updateLineItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-right"
                    />
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addLineItem}
            className="mt-4 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add line item
          </button>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notes & Terms</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => updateField('notes', e.target.value)}
                rows={3}
                placeholder="Any additional information or context..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea
                value={form.terms}
                onChange={e => updateField('terms', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pb-8">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !form.title || !form.client_name || !form.client_email}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('sent')}
            disabled={saving || !form.title || !form.client_name || !form.client_email}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Send Proposal'}
          </button>
        </div>
      </div>
    </div>
  )
}
