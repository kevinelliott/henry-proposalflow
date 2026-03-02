'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, User } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    brand_color: '#7c3aed',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          brand_color: data.brand_color || '#7c3aed',
        })
      }
    }
    load()
  }, [supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Customize your ProposalFlow account</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => setForm(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Agency"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.brand_color}
                  onChange={e => setForm(prev => ({ ...prev, brand_color: e.target.value }))}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brand_color}
                  onChange={e => setForm(prev => ({ ...prev, brand_color: e.target.value }))}
                  placeholder="#7c3aed"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Used in client proposal portal headers</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
