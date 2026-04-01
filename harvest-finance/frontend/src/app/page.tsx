import Link from 'next/link';

const fundingMetrics = [
  { label: 'Active financing requests', value: '128', change: '+12% this week' },
  { label: 'Verified deliveries', value: '342', change: 'Up from 301 last week' },
  { label: 'Settlement completion', value: '96%', change: 'Stable across all regions' },
];

const monthlyVolumes = [
  { month: 'Jan', height: 'h-20' },
  { month: 'Feb', height: 'h-28' },
  { month: 'Mar', height: 'h-24' },
  { month: 'Apr', height: 'h-36' },
  { month: 'May', height: 'h-32' },
  { month: 'Jun', height: 'h-40' },
];

const workflowSteps = [
  {
    title: 'Intake and verification',
    description: 'Orders, farm records, and inspector tasks share one spacing system and one visual language.',
  },
  {
    title: 'Responsive review surfaces',
    description: 'Cards stack cleanly on mobile and expand into structured analytics panels on larger screens.',
  },
  {
    title: 'Consistent actions',
    description: 'Buttons, inputs, and navigation links now follow a predictable hierarchy across the frontend.',
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <div className="content-wrap">
        <header className="top-nav">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
              Harvest Finance
            </p>
            <p className="mt-1 text-sm text-slate-600">Agro-finance workflows with cleaner structure and clearer data.</p>
          </div>

          <nav className="nav-links">
            <a href="#overview" className="nav-link">
              Overview
            </a>
            <a href="#analytics" className="nav-link">
              Analytics
            </a>
            <a href="#workflow" className="nav-link">
              Workflow
            </a>
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary sm:w-auto">
              Get started
            </Link>
          </nav>
        </header>

        <main className="space-y-6">
          <section className="surface-card px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid items-start">
              <div>
                <span className="eyebrow">Issue #34 refresh</span>
                <h1 className="headline mt-5">
                  Consistent green-and-white styling for every core workflow.
                </h1>
                <p className="support-text mt-5 max-w-2xl">
                  The interface now uses shared spacing, stronger typography, and a unified agro palette
                  across navigation, cards, forms, and analytics surfaces.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup" className="btn-primary sm:w-auto">
                    Create an account
                  </Link>
                  <Link href="/forgot-password" className="btn-secondary">
                    Reset credentials
                  </Link>
                </div>
              </div>

              <div className="section-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Funding pipeline</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">$1.8M</p>
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand-strong)]">
                    +18.4%
                  </span>
                </div>

                <div className="mt-6 chart-row">
                  {monthlyVolumes.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                      <div className={`chart-bar w-full max-w-12 ${item.height}`} />
                      <span className="text-xs text-slate-500">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="overview" className="grid gap-4 lg:grid-cols-3">
            {fundingMetrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
                <p className="mt-2 text-sm text-[var(--brand-strong)]">{metric.change}</p>
              </article>
            ))}
          </section>

          <section id="analytics" className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <article className="section-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="eyebrow">Analytics</span>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                    Dashboard cards and chart layout now follow one rhythm
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  Consistent padding, responsive columns, and clearer text hierarchy make the data easier to scan.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] bg-[#f7faf4] p-5">
                  <p className="text-sm text-slate-500">Average loan ticket</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">$14,200</p>
                </div>
                <div className="rounded-[24px] bg-[#f7faf4] p-5">
                  <p className="text-sm text-slate-500">Inspector response time</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">2h 15m</p>
                </div>
                <div className="rounded-[24px] bg-[#f7faf4] p-5">
                  <p className="text-sm text-slate-500">Payout accuracy</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">99.2%</p>
                </div>
              </div>
            </article>

            <aside className="section-card">
              <span className="eyebrow">Navigation</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Cleaner paths for common actions
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[22px] border border-[rgba(47,122,66,0.12)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Primary CTA</p>
                  <p className="mt-1 text-sm text-slate-600">High-contrast green buttons reserved for the next key step.</p>
                </div>
                <div className="rounded-[22px] border border-[rgba(47,122,66,0.12)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Secondary actions</p>
                  <p className="mt-1 text-sm text-slate-600">Neutral surfaces reduce noise while keeping links and actions easy to spot.</p>
                </div>
                <div className="rounded-[22px] border border-[rgba(47,122,66,0.12)] p-4">
                  <p className="text-sm font-semibold text-slate-900">Form controls</p>
                  <p className="mt-1 text-sm text-slate-600">Inputs share identical height, radius, focus state, and spacing rules.</p>
                </div>
              </div>
            </aside>
          </section>

          <section id="workflow" className="section-card">
            <span className="eyebrow">Workflow</span>
            <div className="mt-4 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Responsive from mobile forms to desktop analytics
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The refreshed UI keeps small-screen forms readable while preserving stronger information
                  density on larger dashboard surfaces.
                </p>
              </div>

              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-[24px] border border-[rgba(47,122,66,0.12)] p-5">
                    <p className="text-sm font-semibold text-[var(--brand-strong)]">0{index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
