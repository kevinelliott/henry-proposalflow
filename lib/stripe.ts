import type Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const StripeClass = require('stripe')
    stripeInstance = new StripeClass(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    }) as Stripe
  }
  return stripeInstance!
}
