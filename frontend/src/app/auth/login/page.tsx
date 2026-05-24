'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-white" />
          <span className="text-white text-xl font-medium tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
        </Link>
        <div>
          <h2 className="text-white mb-4" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.04em', fontFamily: 'Sora, sans-serif' }}>
            Your education<br />loan, simplified.
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-xs">
            AI-powered eligibility scoring, transparent decisions, and instant insights — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Students Funded', value: '50,000+' },
            { label: 'Approval Rate', value: '78%' },
            { label: 'Avg Processing', value: '48 hrs' },
            { label: 'Loan Range', value: '₹2L–₹1Cr' },
          ].map(s => (
            <div key={s.label} className="border border-white/10 rounded-xl p-4">
              <p className="text-white font-medium text-xl" style={{ letterSpacing: '-0.02em' }}>{s.value}</p>
              <p className="text-white/40 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <LogoIcon className="w-6 h-6 text-black" />
            <span className="text-black text-xl font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
          </Link>

          <p className="text-black/40 text-sm mb-2">Welcome back</p>
          <h1 className="text-black mb-8" style={{ fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif' }}>
            Sign in
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
                style={{ borderColor: errors.email ? '#ef4444' : '#e5e7eb' }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all pr-12"
                  style={{ borderColor: errors.password ? '#ef4444' : '#e5e7eb' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <>
                  Sign In
                  <span className="bg-white rounded-full p-1.5 ml-auto">
                    <ArrowRight className="w-4 h-4 text-black" />
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-black/50 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-black font-medium hover:underline">Apply Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
