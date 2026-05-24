'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, TrendingUp, AlertTriangle, CheckCircle2, Search, LogOut, BarChart3, Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { adminApi, applicationsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { AdminAnalytics, Application } from '@/types';
import { getStatusLabel, getLeadCategoryLabel, formatCurrency, formatDate, getScoreColor } from '@/lib/utils';
import AuthGuard from '@/components/shared/AuthGuard';

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

function StatCard({ label, value, dark = false }: { label: string; value: string | number; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${dark ? 'bg-black' : 'bg-white border border-black/8'}`}>
      <p className={`text-3xl font-bold mb-1 ${dark ? 'text-white' : 'text-black'}`}
        style={{ letterSpacing: '-0.04em', fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className={`text-xs ${dark ? 'text-white/40' : 'text-black/40'}`}>{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<'overview'|'applications'|'users'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics|null>(null);
  const [apps, setApps] = useState<{applications:Application[];total:number;totalPages:number}>({applications:[],total:0,totalPages:1});
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({status:'',leadCategory:'',search:''});
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string|null>(null);

  useEffect(() => {
    if (tab==='overview') fetchAnalytics();
    if (tab==='applications') fetchApps();
    if (tab==='users') fetchUsers();
  }, [tab, filters, page]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try { const r = await adminApi.getAnalytics(); setAnalytics(r.data); }
    catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const fetchApps = async () => {
    setLoading(true);
    try { const r = await adminApi.getApplications({...filters,page}); setApps(r.data); }
    catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await adminApi.getUsers(filters.search); setUsers(r.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (appId: string, status: string) => {
    setUpdating(appId);
    try { await applicationsApi.updateStatus(appId, {status}); toast.success('Updated'); fetchApps(); }
    catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  };

  return (
    <AuthGuard adminOnly>
      <div className="min-h-screen flex" style={{ backgroundColor: '#F5F5F5' }}>
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-black/8 flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-black/8">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-6 h-6 text-black" />
              <span className="font-medium text-black text-lg tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
            </Link>
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-medium">Admin</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'users', label: 'Users', icon: Users },
            ].map(item => (
              <button key={item.id} onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab===item.id ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'}`}>
                <item.icon className="w-4 h-4" />{item.label}
              </button>
            ))}
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-black/50 hover:bg-black/5 hover:text-black text-sm font-medium transition-colors">
              <TrendingUp className="w-4 h-4" /> Student View
            </Link>
          </nav>

          <div className="p-4 border-t border-black/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-black text-sm truncate">{user?.name}</p>
                <p className="text-black/40 text-xs">Administrator</p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-black/40 hover:bg-black/5 hover:text-black text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-10">

            {/* OVERVIEW */}
            {tab==='overview' && (
              <div className="space-y-8">
                <div>
                  <p className="text-black/40 text-sm mb-1">Analytics</p>
                  <h1 className="text-black" style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif' }}>Platform Overview</h1>
                </div>
                {loading||!analytics ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-black/30" /></div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard label="Total Applications" value={analytics.overview.totalApplications} dark />
                      <StatCard label="High Quality Leads" value={analytics.overview.highQuality} />
                      <StatCard label="Dead Leads" value={analytics.overview.deadLeads} />
                      <StatCard label="Approval Rate" value={`${analytics.overview.approvalRate}%`} />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard label="Approved" value={analytics.overview.approved} />
                      <StatCard label="Under Review" value={analytics.overview.underReview} />
                      <StatCard label="Avg AI Score" value={analytics.overview.averageScore} />
                      <StatCard label="Total Loan Value" value={formatCurrency(analytics.overview.totalLoanValue)} />
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl border border-black/8 p-6">
                        <p className="font-medium text-black mb-4" style={{ fontFamily:'Sora,sans-serif', letterSpacing:'-0.01em' }}>Lead Quality Distribution</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={analytics.leadDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                              label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                              {analytics.leadDistribution.map((e,i)=><Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-white rounded-2xl border border-black/8 p-6">
                        <p className="font-medium text-black mb-4" style={{ fontFamily:'Sora,sans-serif', letterSpacing:'-0.01em' }}>Status Breakdown</p>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={analytics.statusDistribution}>
                            <XAxis dataKey="name" tick={{fontSize:11}} />
                            <YAxis tick={{fontSize:11}} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#111111" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* APPLICATIONS */}
            {tab==='applications' && (
              <div className="space-y-6">
                <div>
                  <p className="text-black/40 text-sm mb-1">Management</p>
                  <h1 className="text-black" style={{ fontSize:'1.75rem', fontWeight:500, letterSpacing:'-0.03em', fontFamily:'Sora,sans-serif' }}>
                    All Applications <span className="text-black/30 text-lg">({apps.total})</span>
                  </h1>
                </div>
                {/* Filters */}
                <div className="bg-white rounded-2xl border border-black/8 p-4 flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-48">
                    <Search className="w-4 h-4 text-black/30" />
                    <input value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
                      placeholder="Search by name or email..."
                      className="flex-1 text-sm outline-none text-black bg-transparent placeholder-black/30" />
                  </div>
                  <select value={filters.status} onChange={e=>{setFilters(f=>({...f,status:e.target.value}));setPage(1);}}
                    className="px-3 py-2 rounded-xl border border-black/10 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
                    <option value="">All Statuses</option>
                    {['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DEAD_LEAD'].map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
                  </select>
                  <select value={filters.leadCategory} onChange={e=>{setFilters(f=>({...f,leadCategory:e.target.value}));setPage(1);}}
                    className="px-3 py-2 rounded-xl border border-black/10 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
                    <option value="">All Categories</option>
                    {['HIGH_QUALITY','MEDIUM_QUALITY','LOW_QUALITY','UNSCORED'].map(c=><option key={c} value={c}>{getLeadCategoryLabel(c)}</option>)}
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-black/30" /></div>
                ) : (
                  <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-black/6">
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Applicant</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">University</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Amount</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Score</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Category</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apps.applications.map(app=>(
                            <tr key={app.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-medium text-black text-sm">{(app as any).user?.name||app.personalDetails?.fullName||'—'}</p>
                                <p className="text-black/30 text-xs">{(app as any).user?.email||'—'}</p>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-sm text-black/60 truncate max-w-32">{app.academicDetails?.universityName||'—'}</p>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-sm font-medium text-black">{app.loanAmount?formatCurrency(app.loanAmount):'—'}</p>
                              </td>
                              <td className="px-5 py-4">
                                {app.leadScore!=null
                                  ? <span className="text-sm font-bold text-black" style={{letterSpacing:'-0.02em'}}>{app.leadScore}</span>
                                  : <span className="text-black/25 text-sm">—</span>}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  app.leadCategory==='HIGH_QUALITY'?'bg-emerald-50 text-emerald-700':
                                  app.leadCategory==='MEDIUM_QUALITY'?'bg-amber-50 text-amber-600':
                                  app.leadCategory==='LOW_QUALITY'?'bg-red-50 text-red-600':'bg-black/5 text-black/40'}`}>
                                  {getLeadCategoryLabel(app.leadCategory)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  app.status==='APPROVED'?'bg-emerald-50 text-emerald-700':
                                  app.status==='REJECTED'?'bg-red-50 text-red-600':
                                  app.status==='UNDER_REVIEW'?'bg-amber-50 text-amber-600':
                                  app.status==='DEAD_LEAD'?'bg-black/5 text-black/40':'bg-blue-50 text-blue-600'}`}>
                                  {getStatusLabel(app.status)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {['SUBMITTED','UNDER_REVIEW'].includes(app.status) && (
                                  <div className="flex gap-2">
                                    <button onClick={()=>handleStatusUpdate(app.id,'APPROVED')} disabled={updating===app.id}
                                      className="px-3 py-1 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                                      {updating===app.id?<Loader2 className="w-3 h-3 animate-spin"/>:'Approve'}
                                    </button>
                                    <button onClick={()=>handleStatusUpdate(app.id,'REJECTED')} disabled={updating===app.id}
                                      className="px-3 py-1 rounded-full border border-black/15 text-black/60 text-xs font-medium hover:bg-black/5 transition-colors disabled:opacity-50">
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {apps.totalPages>1 && (
                      <div className="flex items-center justify-between px-5 py-3 border-t border-black/6">
                        <p className="text-sm text-black/40">Page {page} of {apps.totalPages}</p>
                        <div className="flex gap-2">
                          <button onClick={()=>setPage(p=>p-1)} disabled={page===1}
                            className="p-1.5 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5">
                            <ChevronLeft className="w-4 h-4 text-black/60" />
                          </button>
                          <button onClick={()=>setPage(p=>p+1)} disabled={page>=apps.totalPages}
                            className="p-1.5 rounded-lg border border-black/10 disabled:opacity-30 hover:bg-black/5">
                            <ChevronRight className="w-4 h-4 text-black/60" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* USERS */}
            {tab==='users' && (
              <div className="space-y-6">
                <div>
                  <p className="text-black/40 text-sm mb-1">Management</p>
                  <h1 className="text-black" style={{ fontSize:'1.75rem', fontWeight:500, letterSpacing:'-0.03em', fontFamily:'Sora,sans-serif' }}>Users</h1>
                </div>
                <div className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-black/30" />
                  <input value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}
                    placeholder="Search users..." className="flex-1 text-sm outline-none text-black bg-transparent placeholder-black/30" />
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-black/30" /></div>
                ) : (
                  <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-black/6">
                          {['User','Phone','Role','Applications','Joined'].map(h=>(
                            <th key={h} className="text-left px-5 py-3 text-xs font-medium text-black/40 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u=>(
                          <tr key={u.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-black text-sm">{u.name}</p>
                                  <p className="text-black/30 text-xs">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-black/60">{u.phone}</td>
                            <td className="px-5 py-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role==='ADMIN'?'bg-black text-white':'bg-black/5 text-black/60'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-black">{u._count?.applications||0}</td>
                            <td className="px-5 py-4 text-sm text-black/40">{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
