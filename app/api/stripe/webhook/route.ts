import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { user_id?: string }; customer?: string; subscription?: string }
    const userId = session.metadata?.user_id
    const customerId = session.customer as string

    if (userId) {
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          subscription_status: 'active',
        })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as { customer: string; status: string }
    const customerId = subscription.customer

    await supabase
      .from('profiles')
      .update({ subscription_status: subscription.status })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
