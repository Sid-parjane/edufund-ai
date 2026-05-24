'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

// Logo Icon SVG
function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

const NAV_LINKS = ['Features', 'How It Works', 'Eligibility', 'FAQ'];

const PARTNERS = ['IIT Delhi', 'HDFC Bank', 'SBI', 'Axis Bank', 'ICICI Bank', 'Bajaj Finserv', 'Credila', 'Avanse'];
const BACKERS = ['Sequoia', 'Tiger Global', 'Matrix Partners', 'Blume Ventures', 'Accel', 'Elevation Capital', 'Lightspeed', 'Peak XV'];

const FAQS = [
  { q: 'What is the minimum loan amount?', a: 'We process loans starting from ₹2 Lakh up to ₹1 Crore for eligible applicants.' },
  { q: 'How long does approval take?', a: 'Our AI scoring is instant. Full approval typically takes 24-72 business hours.' },
  { q: 'Is collateral required?', a: 'For loans up to ₹7.5L, no collateral needed. Above that, property documents may be required.' },
  { q: 'Which countries are covered?', a: 'We cover India, USA, UK, Canada, Australia, Germany, Singapore, and 50+ more countries.' },
  { q: 'What is the interest rate?', a: 'Interest rates start from 9.5% p.a. based on your profile, university, and co-applicant.' },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#F5F5F5', fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── HERO WRAPPER ─────────────────────────────────── */}
      <div className="h-screen flex flex-col overflow-hidden">

        {/* NAVBAR */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-[88rem] mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-medium tracking-tight text-black" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                  className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
                  {link}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="text-base font-medium text-gray-700 hover:text-black transition-colors duration-200 px-4">
                Login
              </Link>
              <Link href="/auth/signup"
                className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Apply Now
              </Link>
            </div>

            <button className="md:hidden text-black" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden mt-4 bg-white rounded-2xl p-6 shadow-lg space-y-4">
              {NAV_LINKS.map(link => (
                <a key={link} href="#" className="block text-base font-medium text-gray-700">{link}</a>
              ))}
              <Link href="/auth/signup" className="block w-full text-center bg-black text-white py-3 rounded-full font-medium">
                Apply Now
              </Link>
            </div>
          )}
        </nav>

        {/* HERO SECTION */}
        <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
          <div className="relative w-full rounded-2xl overflow-hidden max-w-[88rem] mx-auto" style={{ height: 'calc(100vh - 96px)' }}>

            {/* Background — dark gradient (no external video needed) */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-950 to-slate-900">
              {/* Decorative blobs */}
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500 rounded-full opacity-15 blur-3xl" />
              <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-sm font-medium">AI-Powered Education Loans</span>
              </div>

              <h1 className="text-white max-w-2xl mb-4" style={{
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                fontFamily: 'Sora, sans-serif'
              }}>
                Your Dreams<br />Get Funded
              </h1>

              <p className="text-white/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
                style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
                An AI-powered education loan platform built for ambitious students — instant eligibility, transparent scoring, and effortless access to funds.
              </p>

              <Link href="/auth/signup"
                className="inline-flex items-center gap-3 bg-white text-black text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                Apply for Free
                <span className="bg-black rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-white" />
                </span>
              </Link>

              {/* Brand Marquee */}
              <div className="mt-16 w-full max-w-lg overflow-hidden">
                <style>{`
                  @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
                  .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
                `}</style>
                <div className="marquee-track">
                  {[...PARTNERS, ...PARTNERS].map((name, i) => (
                    <span key={i} className="mx-7 shrink-0 text-white/50 whitespace-nowrap text-sm font-medium">{name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats bottom right */}
            <div className="absolute bottom-10 right-10 hidden lg:grid grid-cols-2 gap-4 z-10">
              {[
                { label: 'Students Funded', value: '50,000+' },
                { label: 'Approval Rate', value: '78%' },
                { label: 'Avg Processing', value: '48 hrs' },
                { label: 'Loan Range', value: '₹2L–₹1Cr' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-5 py-3 text-right">
                  <p className="text-white font-bold text-xl" style={{ letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO SECTION ─────────────────────────────────── */}
      <section id="features" style={{ backgroundColor: '#F5F5F5' }} className="px-6 py-24">
        <div className="max-w-[88rem] mx-auto">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
            <div>
              <h2 className="text-black mb-8" style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                fontFamily: 'Sora, sans-serif'
              }}>
                Meet EduFund AI.
              </h2>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                Discover it
                <span className="bg-white rounded-full p-2">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
              </Link>
            </div>
            <div>
              <p className="text-black/70 leading-relaxed" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
                EduFund AI is an intelligent loan platform that evaluates your academic profile, financial background, and university tier to give you instant eligibility insights.
              </p>
            </div>
          </div>

          {/* Row 2 — 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1 — spans 2 cols, dark with gradient */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
              <div className="p-7 min-h-80 flex flex-col justify-between">
                <p className="text-white font-medium text-2xl leading-snug" style={{ letterSpacing: '-0.02em', fontFamily: 'Sora, sans-serif' }}>
                  Scores that<br />reveal your potential
                </p>
                <p className="text-white/60 text-base max-w-xs">
                  Gain a transparent AI score from 0–100 as your profile is evaluated across academics, finances, and more.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <p className="text-white font-medium text-2xl leading-snug" style={{ letterSpacing: '-0.02em', fontFamily: 'Sora, sans-serif' }}>
                Always fast,<br />always clear.
              </p>
              <p className="text-white/60 text-base">
                Get your eligibility decision in seconds — no waiting rooms, no ambiguity.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: '#2B2644' }}>
              <p className="text-white font-medium text-2xl leading-snug" style={{ letterSpacing: '-0.02em', fontFamily: 'Sora, sans-serif' }}>
                Fully<br />automated.
              </p>
              <p className="text-white/60 text-base">
                Skip manual paperwork. EduFund AI handles scoring, detection, and insights in the background.
              </p>
            </div>

            {/* Card 4 — light */}
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-white lg:col-span-2">
              <p className="text-black font-medium text-2xl leading-snug" style={{ letterSpacing: '-0.02em', fontFamily: 'Sora, sans-serif' }}>
                Smart fraud<br />detection built in.
              </p>
              <p className="text-black/60 text-base max-w-xs">
                Our dead lead engine automatically flags fake applications, disposable emails, and suspicious patterns.
              </p>
            </div>

            {/* Card 5 — accent */}
            <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between lg:col-span-2" style={{ backgroundColor: '#e0f2fe' }}>
              <p className="text-black font-medium text-2xl leading-snug" style={{ letterSpacing: '-0.02em', fontFamily: 'Sora, sans-serif' }}>
                Tier-1 university<br />recognition.
              </p>
              <p className="text-black/60 text-base max-w-xs">
                IIT, IIM, NIT, BITS, MIT, Stanford and 50+ top institutions automatically boost your eligibility score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BACKED BY SECTION ────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F5F5' }} className="px-6 py-12 border-t border-black/10">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          <div>
            <p className="text-black/60 text-base leading-relaxed">
              Trusted by students from<br />premier institutions.
            </p>
          </div>
          <div className="md:col-span-3 overflow-hidden">
            <style>{`
              @keyframes backers-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
              .backers-track { display: flex; width: max-content; animation: backers-marquee 30s linear infinite; }
            `}</style>
            <div className="backers-track">
              {[...BACKERS, ...BACKERS].map((name, i) => (
                <span key={i} className="mx-10 shrink-0 text-black/40 whitespace-nowrap font-medium text-sm">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" style={{ backgroundColor: '#F5F5F5' }} className="px-6 py-24">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Left */}
          <div className="md:pr-12 md:pt-2">
            <p className="text-black/50 text-sm mb-2">EduFund AI in Practice</p>
            <h2 className="text-black mb-6" style={{
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontFamily: 'Sora, sans-serif'
            }}>
              How it<br />works
            </h2>
            <p className="text-black/60 text-base leading-relaxed max-w-sm">
              EduFund AI powers a simple 4-step process for students, co-applicants, and families wanting fast and transparent education loan access.
            </p>
          </div>

          {/* Right — steps card */}
          <div className="relative rounded-3xl overflow-hidden min-h-[560px] bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/80" />
            <div className="relative z-10 p-10 md:p-12 h-full flex flex-col justify-between">
              <h3 className="text-white mb-5" style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                fontFamily: 'Sora, sans-serif'
              }}>
                4 steps to<br />your loan
              </h3>
              <div className="space-y-6">
                {[
                  { num: '01', title: 'Create Account', desc: 'Sign up in under 2 minutes.' },
                  { num: '02', title: 'Fill Application', desc: 'Personal, academic & financial details.' },
                  { num: '03', title: 'AI Evaluation', desc: 'Instant score with Groq AI insights.' },
                  { num: '04', title: 'Get Decision', desc: 'Transparent result with full reasoning.' },
                ].map(step => (
                  <div key={step.num} className="flex items-start gap-4">
                    <span className="text-white/30 font-medium text-sm mt-0.5 w-6 shrink-0">{step.num}</span>
                    <div>
                      <p className="text-white font-medium text-base">{step.title}</p>
                      <p className="text-white/50 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup"
                className="mt-8 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group">
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
                <span className="text-base font-medium">Start application</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ELIGIBILITY ──────────────────────────────────── */}
      <section id="eligibility" style={{ backgroundColor: '#F5F5F5' }} className="px-6 py-24 border-t border-black/10">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-black/50 text-sm mb-2">Who Qualifies</p>
            <h2 className="text-black mb-8" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              fontFamily: 'Sora, sans-serif'
            }}>
              Eligibility<br />criteria
            </h2>
            <div className="space-y-4">
              {[
                'Indian citizens aged 18 and above',
                'Enrolled or admitted to a recognized institution',
                'Pursuing UG, PG, or Doctoral programs',
                'Valid PAN and Aadhaar for KYC',
                'Co-applicant (parent/guardian) preferred',
                'Course duration of at least 1 year',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 py-3 border-b border-black/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                  <span className="text-black/70 text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black rounded-3xl p-8 md:p-10">
            <p className="text-white/50 text-sm mb-6">Loan Parameters</p>
            <div className="space-y-0">
              {[
                { label: 'Loan Amount', value: '₹2L – ₹1 Crore' },
                { label: 'Interest Rate', value: 'From 9.5% p.a.' },
                { label: 'Repayment Period', value: 'Up to 15 years' },
                { label: 'Processing Fee', value: '1–2% of loan amount' },
                { label: 'Moratorium Period', value: 'Course + 6 months' },
                { label: 'Countries Covered', value: '50+ countries' },
              ].map((item, i) => (
                <div key={item.label} className={`flex justify-between py-4 ${i < 5 ? 'border-b border-white/10' : ''}`}>
                  <span className="text-white/50 text-base">{item.label}</span>
                  <span className="text-white font-medium text-base">{item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/signup"
              className="mt-8 inline-flex items-center gap-3 bg-white text-black text-base font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              Apply Now
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-4 h-4 text-white" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" style={{ backgroundColor: '#F5F5F5' }} className="px-6 py-24 border-t border-black/10">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-black/50 text-sm mb-2">Questions</p>
            <h2 className="text-black" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              fontFamily: 'Sora, sans-serif'
            }}>
              Frequently<br />asked
            </h2>
          </div>
          <div className="space-y-0">
            {FAQS.map((faq, i) => (
              <div key={i} className={`py-5 ${i < FAQS.length - 1 ? 'border-b border-black/10' : ''}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left gap-4"
                >
                  <span className="font-medium text-black text-base">{faq.q}</span>
                  <span className={`w-6 h-6 rounded-full border border-black/20 flex items-center justify-center shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <span className="text-black text-lg leading-none" style={{ marginTop: '-1px' }}>+</span>
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-black/60 text-base leading-relaxed pr-10">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────── */}
      <section className="px-6 py-24 bg-black">
        <div className="max-w-[88rem] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <LogoIcon className="w-7 h-7 text-white" />
              <span className="text-white text-2xl font-medium tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
            </div>
            <h2 className="text-white max-w-lg" style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              fontFamily: 'Sora, sans-serif'
            }}>
              Ready to fund<br />your education?
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-6">
            <Link href="/auth/signup"
              className="inline-flex items-center gap-3 bg-white text-black text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              Start Application
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-5 h-5 text-white" />
              </span>
            </Link>
            <p className="text-white/40 text-sm">No credit check to apply. Takes under 10 minutes.</p>
            <div className="flex gap-6 text-white/40 text-sm">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
