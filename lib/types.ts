export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  logo_url: string | null
  brand_color: string
  created_at: string
  subscription_status: string | null
  stripe_customer_id: string | null
}

export interface Proposal {
  id: string
  user_id: string
  client_name: string
  client_email: string
  client_company: string | null
  title: string
  intro_message: string | null
  status: ProposalStatus
  valid_until: string | null
  public_token: string
  currency: string
  total_amount: number
  notes: string | null
  terms: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  viewed_at: string | null
  accepted_at: string | null
  declined_at: string | null
}

export interface LineItem {
  id: string
  proposal_id: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
  sort_order: number
}

export interface ProposalView {
  id: string
  proposal_id: string
  viewed_at: string
  ip_address: string | null
  user_agent: string | null
}

export interface FollowUp {
  id: string
  proposal_id: string
  scheduled_for: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'cancelled'
  subject: string
  body: string
}
