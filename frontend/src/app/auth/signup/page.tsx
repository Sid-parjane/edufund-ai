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

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = 'Full name required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Valid 10-digit Indian number';
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password))
      errs.password = 'Need uppercase, lowercase, number & special char';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pwStrength = () => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[@$!%*?&]/.test(form.password)) s++;
    return s;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.signup(form);
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = pwStrength();
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

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
            Fund your future<br />starting today.
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-xs">
            Join 50,000+ students who got their education loans approved with AI-powered scoring.
          </p>
        </div>
        <div className="space-y-3">
          {['No hidden charges', 'Instant AI eligibility score', 'Real-time Groq AI insights', '50+ countries covered'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
              <span className="text-white/50 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <LogoIcon className="w-6 h-6 text-black" />
            <span className="text-black text-xl font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
          </Link>

          <p className="text-black/40 text-sm mb-2">Get started</p>
          <h1 className="text-black mb-8" style={{ fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif' }}>
            Create account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Priya Sharma"
                className="w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
                style={{ borderColor: errors.name ? '#ef4444' : '#e5e7eb' }} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
                style={{ borderColor: errors.email ? '#ef4444' : '#e5e7eb' }} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Phone Number</label>
              <div className="flex">
                <div className="flex items-center px-3 py-3 bg-white border border-r-0 border-gray-200 rounded-l-xl text-black/40 text-sm">+91</div>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210" maxLength={10}
                  className="flex-1 px-4 py-3 rounded-r-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
                  style={{ borderColor: errors.phone ? '#ef4444' : '#e5e7eb' }} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black/60 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 chars with uppercase, number & symbol"
                  className="w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all pr-12"
                  style={{ borderColor: errors.password ? '#ef4444' : '#e5e7eb' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength-1] : 'bg-black/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-black/40">{strength > 0 ? strengthLabels[strength-1] : ''}</span>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <>
                  Create Account
                  <span className="bg-white rounded-full p-1.5 ml-auto">
                    <ArrowRight className="w-4 h-4 text-black" />
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-black/50 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-black font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
