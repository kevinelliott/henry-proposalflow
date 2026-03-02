import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://henry-proposalflow.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{
        price: process.env.STRIPE_PRICE_ID_PRO || 'price_placeholder',
        quantity: 1,
      }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing`,
      metadata: { user_id: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
