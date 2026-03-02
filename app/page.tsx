import Link from 'next/link'
import { FileText, Eye, Clock, TrendingUp, CheckCircle, ArrowRight, Zap, Send } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ProposalFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Proposals that follow up themselves
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop losing deals to<br />
            <span className="text-violet-600">forgotten proposals</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Create beautiful proposals, know the moment clients view them, and automatically
            follow up until you get a yes or no. Close 40% more deals.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              Create your first proposal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-gray-400">Free 14-day trial, no card needed</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to close deals</h2>
            <p className="text-gray-500">Built for freelancers and small agencies who want to look professional and win more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Beautiful proposals',
                desc: "Branded proposals with line items, custom terms, and a polished client portal — no design skills needed.",
              },
              {
                icon: Eye,
                title: 'Real-time view tracking',
                desc: "Get notified the moment your client opens a proposal. Know exactly when they're engaged.",
              },
              {
                icon: Clock,
                title: 'Automated follow-ups',
                desc: "Set it and forget it. Proposals that haven't been viewed or responded to automatically send friendly nudges.",
              },
              {
                icon: Send,
                title: 'One-click send',
                desc: 'Send professional proposals via a branded link. Clients sign in seconds — no account required.',
              },
              {
                icon: CheckCircle,
                title: 'Digital acceptance',
                desc: 'Clients accept or decline with a click. Accepted proposals create a paper trail you can convert to contracts.',
              },
              {
                icon: TrendingUp,
                title: 'Win rate analytics',
                desc: 'Track your proposal-to-close rate, average time to decision, and which proposals are sitting idle.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500 mb-10">One plan, everything included. Cancel anytime.</p>
          <div className="bg-white border-2 border-violet-600 rounded-2xl p-8 text-left max-w-sm mx-auto shadow-xl">
            <div className="text-sm text-violet-600 font-semibold mb-2">Pro Plan</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900">$49</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited proposals',
                'View tracking & notifications',
                'Automated follow-up sequences',
                'Client acceptance portal',
                'Custom branding & logo',
                'Analytics dashboard',
                'Email support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="w-full block text-center bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors"
            >
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span>ProposalFlow</span>
          </div>
          <span>© 2026 ProposalFlow. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
