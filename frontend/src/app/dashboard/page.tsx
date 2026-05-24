'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, LogOut, BarChart3, ChevronRight, Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { Application } from '@/types';
import { getStatusLabel, getLeadCategoryLabel, formatCurrency, formatDate, getScoreColor } from '@/lib/utils';
import AuthGuard from '@/components/shared/AuthGuard';

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 32;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 45 ? '#d97706' : '#dc2626';
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="32" fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="36" cy="36" r="32" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <span className="text-lg font-bold text-black" style={{ letterSpacing: '-0.02em' }}>{score}</span>
        <span className="text-black/30 text-xs block" style={{ marginTop: '-2px' }}>/100</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; style: string }> = {
    DRAFT:        { icon: <FileText className="w-3 h-3" />,      label: 'Draft',        style: 'bg-black/5 text-black/50' },
    SUBMITTED:    { icon: <Clock className="w-3 h-3" />,         label: 'Submitted',    style: 'bg-blue-50 text-blue-600' },
    UNDER_REVIEW: { icon: <RefreshCw className="w-3 h-3" />,     label: 'Under Review', style: 'bg-amber-50 text-amber-600' },
    APPROVED:     { icon: <CheckCircle2 className="w-3 h-3" />,  label: 'Approved',     style: 'bg-emerald-50 text-emerald-700' },
    REJECTED:     { icon: <XCircle className="w-3 h-3" />,       label: 'Rejected',     style: 'bg-red-50 text-red-600' },
    DEAD_LEAD:    { icon: <AlertCircle className="w-3 h-3" />,   label: 'Dead Lead',    style: 'bg-black/5 text-black/40' },
  };
  const c = config[status] || config.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.style}`}>
      {c.icon}{c.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, string> = {
    HIGH_QUALITY:   'bg-emerald-50 text-emerald-700',
    MEDIUM_QUALITY: 'bg-amber-50 text-amber-600',
    LOW_QUALITY:    'bg-red-50 text-red-600',
    UNSCORED:       'bg-black/5 text-black/40',
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config[category] || config.UNSCORED}`}>
      {getLeadCategoryLabel(category)}
    </span>
  );
}

function ApplicationCard({ app, onContinue }: { app: Application; onContinue: (id: string) => void }) {
  const completedSteps = [app.personalDetails, app.academicDetails, app.financialDetails, app.loanDetails].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-black/8 hover:border-black/15 transition-all overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-medium text-black text-base" style={{ letterSpacing: '-0.01em' }}>
              {app.personalDetails?.fullName || 'Draft Application'}
            </p>
            <p className="text-black/30 text-xs mt-0.5">ID: {app.id.slice(0, 12)}...</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={app.status} />
            {app.leadCategory !== 'UNSCORED' && <CategoryBadge category={app.leadCategory} />}
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-black/6 mb-4">
          <div>
            <p className="text-black/30 text-xs mb-1">Loan Amount</p>
            <p className="font-medium text-black text-sm" style={{ letterSpacing: '-0.01em' }}>
              {app.loanDetails?.requiredAmount ? formatCurrency(app.loanDetails.requiredAmount) : '—'}
            </p>
          </div>
          <div>
            <p className="text-black/30 text-xs mb-1">University</p>
            <p className="font-medium text-black text-sm truncate">{app.academicDetails?.universityName || '—'}</p>
          </div>
          <div>
            <p className="text-black/30 text-xs mb-1">Applied</p>
            <p className="font-medium text-black text-sm">{formatDate(app.createdAt)}</p>
          </div>
        </div>

        {/* AI Score */}
        {app.leadScore != null && (
          <div className="flex items-center justify-between bg-black/3 rounded-xl p-4 mb-4">
            <div>
              <p className="text-black/40 text-xs mb-1">AI Lead Score</p>
              <p className="font-bold text-2xl text-black" style={{ letterSpacing: '-0.03em' }}>
                {app.leadScore}<span className="text-black/30 text-sm font-normal">/100</span>
              </p>
              {app.riskLevel && (
                <p className="text-black/40 text-xs mt-0.5">Risk: {app.riskLevel.replace('_', ' ')}</p>
              )}
            </div>
            <ScoreRing score={app.leadScore} />
          </div>
        )}

        {/* AI Risk Summary */}
        {(app as any).notes && (
          <div className="bg-black rounded-xl p-4 mb-4">
            <p className="text-white/50 text-xs font-medium mb-1.5">🤖 AI Risk Summary</p>
            <p className="text-white/80 text-xs leading-relaxed">{(app as any).notes}</p>
          </div>
        )}

        {/* Dead lead reason */}
        {app.status === 'DEAD_LEAD' && app.deadLeadReason && (
          <div className="border border-red-100 bg-red-50 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-xs"><span className="font-medium">Flagged:</span> {app.deadLeadReason}</p>
          </div>
        )}

        {/* Score insights */}
        {app.scoringLogs && app.scoringLogs.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <p className="text-black/30 text-xs font-medium uppercase tracking-wide">Score Breakdown</p>
            {app.scoringLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-black/50">{log.explanation}</span>
                <span className={`font-semibold tabular-nums ${log.points > 0 ? 'text-emerald-600' : log.points < 0 ? 'text-red-500' : 'text-black/30'}`}>
                  {log.points > 0 ? `+${log.points}` : log.points}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Draft progress */}
        {app.status === 'DRAFT' && (
          <div className="mb-0">
            <div className="flex items-center justify-between text-xs text-black/40 mb-1.5">
              <span>Application progress</span><span>{completedSteps}/4 steps</span>
            </div>
            <div className="w-full bg-black/8 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(completedSteps / 4) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {app.status === 'DRAFT' && (
        <div className="border-t border-black/6 px-6 py-3 bg-black/2">
          <button onClick={() => onContinue(app.id)}
            className="text-black text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Continue Application <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <aside className="w-60 bg-white border-r border-black/8 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-black/8">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-6 h-6 text-black" />
          <span className="font-medium text-black text-lg tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black text-white font-medium text-sm">
          <BarChart3 className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/apply" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-black/50 hover:bg-black/5 hover:text-black font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Application
        </Link>
        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-black/50 hover:bg-black/5 hover:text-black font-medium text-sm transition-colors">
            <BarChart3 className="w-4 h-4" /> Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-black/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-black text-sm truncate">{user?.name}</p>
            <p className="text-black/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-black/40 hover:bg-black/5 hover:text-black text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationsApi.getAll();
      setApplications(res.data);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); router.push('/'); toast.success('Signed out'); };
  const handleContinue = (id: string) => router.push(`/apply?id=${id}`);
  const handleNewApplication = async () => {
    try {
      const res = await applicationsApi.create();
      router.push(`/apply?id=${res.data.id}`);
    } catch { toast.error('Failed to create application'); }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    drafts: applications.filter(a => a.status === 'DRAFT').length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex" style={{ backgroundColor: '#F5F5F5' }}>
        <Sidebar user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-black/40 text-sm mb-1">Welcome back</p>
                <h1 className="text-black" style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif' }}>
                  {user?.name?.split(' ')[0]}'s Dashboard
                </h1>
              </div>
              <button onClick={handleNewApplication}
                className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 text-sm">
                New Application
                <span className="bg-white rounded-full p-1.5">
                  <Plus className="w-3.5 h-3.5 text-black" />
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Applications', value: stats.total },
                { label: 'Under Review', value: stats.underReview },
                { label: 'Approved', value: stats.approved },
                { label: 'Drafts', value: stats.drafts },
              ].map((s, i) => (
                <div key={s.label} className={`rounded-2xl p-5 ${i === 0 ? 'bg-black' : 'bg-white border border-black/8'}`}>
                  <p className={`text-3xl font-bold mb-1 ${i === 0 ? 'text-white' : 'text-black'}`} style={{ letterSpacing: '-0.04em', fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
                  <p className={`text-xs ${i === 0 ? 'text-white/40' : 'text-black/40'}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Applications */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-black/30" />
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/8 p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-black/20" />
                </div>
                <h3 className="text-black font-medium text-lg mb-2" style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>No applications yet</h3>
                <p className="text-black/40 text-sm mb-6 max-w-xs mx-auto">Start your education loan application and get instant AI eligibility analysis.</p>
                <button onClick={handleNewApplication}
                  className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm">
                  Start Application
                  <span className="bg-white rounded-full p-1.5"><Plus className="w-3.5 h-3.5 text-black" /></span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-black/40 text-sm font-medium uppercase tracking-wide mb-4">Your Applications</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {applications.map(app => (
                    <ApplicationCard key={app.id} app={app} onContinue={handleContinue} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
