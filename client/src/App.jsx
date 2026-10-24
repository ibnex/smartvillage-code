import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Droplets,
  FileWarning,
  FolderKanban,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { statisticsApi } from './api';
import { getErrorMessage } from './api/client';
import { useAuthStore } from './store/authStore';
import { useVillageStore } from './store/villageStore';
import { toast } from './store/uiStore';
import Button from './components/ui/Button';
import Badge, { CategoryBadge, StatusBadge } from './components/ui/Badge';
import { Field, Input } from './components/ui/Form';
import { Avatar, ErrorState, PageLoader } from './components/ui/Misc';
import ProgressBar from './components/ui/ProgressBar';
import ToastContainer from './components/ui/Toast';
import { formatCurrency, formatDate, formatNumber, firstName, timeAgo } from './lib/format';

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-forest-900">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M23 7c-7-.4-13.3 3.4-14.7 9.5-.8 3.4.5 6.4 3.1 8.2 3.8-.7 7.1-2.8 9.3-6C23.2 15.7 23.8 10.9 23 7Z" fill="currentColor" />
          <path d="M8.5 25c1.8-6.3 5.8-10.8 12-13.6" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {!compact ? (
        <div>
          <p className="font-display text-sm font-extrabold tracking-tight text-white">Smart Village</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-200/70">Development dashboard</p>
        </div>
      ) : null}
    </div>
  );
}

function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        toast.success('Your citizen account has been created.');
      } else {
        await login({ email: form.email, password: form.password });
        toast.success('Welcome back to your dashboard.');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setForm(
      role === 'officer'
        ? { ...form, email: 'ibneahad@gmail.com', password: 'asadhodekar' }
        : { ...form, email: 'ibnex54@gmail.com', password: 'Taskeen@786' }
    );
    setError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="relative hidden overflow-hidden bg-forest-900 p-10 lg:flex lg:w-[48%] lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-hero-grid opacity-40" />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-lg">
          <Badge color="white" dot>Connected communities</Badge>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-white">
            Better data for <span className="text-emerald-200">better villages.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-emerald-100/70">
            Monitor development, keep projects moving, and make every citizen&apos;s voice visible.
          </p>
        </div>
        <p className="relative text-xs text-emerald-100/50">Smart Village Informatics &amp; Development Dashboard</p>
      </section>
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo compact /></div>
          <p className="text-sm font-semibold text-emerald-600">{mode === 'signup' ? 'Get started' : 'Welcome back'}</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            {mode === 'signup' ? 'Create your account' : 'Sign in to your dashboard'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === 'signup'
              ? 'Create a citizen account to follow village development and submit complaints.'
              : 'Use your account to access village development data.'}
          </p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            {mode === 'signup' ? (
              <>
                <Field label="Full name" htmlFor="name" required>
                  <Input id="name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" required />
                </Field>
                <Field label="Phone number" htmlFor="phone" hint="Optional">
                  <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Your phone number" />
                </Field>
              </>
            ) : null}
            <Field label="Email address" htmlFor="email" required>
              <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
            </Field>
            <Field label={mode === 'signup' ? 'Create password' : 'Password'} htmlFor="password" required hint={mode === 'signup' ? 'At least 8 characters' : undefined}>
              <Input id="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" minLength={8} required />
            </Field>
            {mode === 'signup' ? <Field label="Confirm password" htmlFor="confirmPassword" required><Input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat your password" minLength={8} required /></Field> : null}
            {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">{error}</div> : null}
            <Button type="submit" className="w-full" size="lg" loading={loading}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Button>
          </form>
          {mode === 'login' ? (
            <div className="mt-8 border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick access</p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => fillDemo('officer')}>Village officer</Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => fillDemo('citizen')}>Citizen</Button>
              </div>
            </div>
          ) : null}
          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')} className="font-semibold text-emerald-700 hover:text-emerald-800">
              {mode === 'signup' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function Sidebar({ user, villages, selectedVillageId, onVillageChange, onLogout, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen ? <button type="button" aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-forest-900 px-4 py-5 shadow-xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2"><Logo /><button type="button" onClick={onClose} className="rounded-lg p-2 text-emerald-100/70 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X size={18} /></button></div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/55">Active village</p>
          <div className="relative mt-2">
            <Building2 size={16} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-200/70" />
            <select value={selectedVillageId || ''} onChange={(event) => onVillageChange(event.target.value)} className="w-full appearance-none rounded-lg border border-white/10 bg-white/10 py-2.5 pl-9 pr-8 text-sm font-medium text-white outline-none focus:border-emerald-300">
              <option value="" className="text-slate-900">Select village</option>
              {villages.map((village) => <option key={village._id} value={village._id} className="text-slate-900">{village.name}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-200/70" />
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/45">Workspace</p>
          <div className="flex items-center gap-3 rounded-xl bg-emerald-100/10 px-3 py-2.5 text-sm font-semibold text-emerald-100"><BarChart3 size={18} /> Overview</div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/60"><FolderKanban size={18} /> Projects</div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/60"><FileWarning size={18} /> Complaints</div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/60"><ClipboardList size={18} /> Reports</div>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2"><Avatar name={user.name} size="sm" className="ring-forest-900" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{user.name}</p><p className="truncate text-xs text-emerald-100/55">{user.role}</p></div><button type="button" onClick={onLogout} className="rounded-lg p-2 text-emerald-100/60 hover:bg-white/10 hover:text-white" title="Sign out"><LogOut size={17} /></button></div>
        </div>
      </aside>
    </>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone = 'emerald' }) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100', blue: 'bg-blue-50 text-blue-700 ring-blue-100', amber: 'bg-amber-50 text-amber-700 ring-amber-100', violet: 'bg-violet-50 text-violet-700 ring-violet-100' };
  return <div className="surface-card p-5"><div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}><Icon size={19} /></div>{detail ? <span className="text-xs font-semibold text-slate-400">{detail}</span> : null}</div><p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>;
}

function Dashboard({ user, dashboard, loading, error, onRetry }) {
  if (loading) return <PageLoader label="Loading village dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!dashboard) return <div className="surface-card p-10 text-center text-sm text-slate-500">Select a village to view its dashboard.</div>;

  const { village, statistics, projects, complaints, activities, users } = dashboard;
  const coverage = [
    { label: 'Water coverage', value: statistics.waterCoverage, icon: Droplets, color: 'blue' },
    { label: 'Electricity coverage', value: statistics.electricityCoverage, icon: Zap, color: 'amber' },
    { label: 'Road connectivity', value: statistics.roadConnectivity, icon: Building2, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-emerald-600">Village overview</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">{village.name}</h1><p className="mt-1 text-sm text-slate-500">{village.district}, {village.state} · Code {village.villageCode}</p></div><Badge color="emerald" dot>Live data</Badge></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Population" value={formatNumber(statistics.population)} detail={`${formatNumber(users?.citizens, '0')} citizens`} tone="blue" />
        <StatCard icon={FolderKanban} label="Active projects" value={formatNumber(projects.total)} detail={`${projects.completionRate}% complete`} />
        <StatCard icon={FileWarning} label="Complaints" value={formatNumber(complaints.total)} detail={`${complaints.resolutionRate}% resolved`} tone="amber" />
        <StatCard icon={ShieldCheck} label="Total project budget" value={formatCurrency(projects.totalBudget, { compact: true })} detail={`${projects.averageProgress}% avg. progress`} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold text-slate-900">Development coverage</h2><p className="mt-1 text-sm text-slate-500">Essential services across {village.name}</p></div><BarChart3 className="text-emerald-600" size={20} /></div><div className="mt-7 space-y-6">{coverage.map(({ label, value, icon: Icon, color }) => <div key={label}><div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-slate-700"><Icon size={16} className="text-slate-400" />{label}</span><span className="font-bold text-slate-900">{value || 0}%</span></div><ProgressBar value={value} color={color} /></div>)}</div><div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center"><div><p className="text-lg font-bold text-slate-900">{formatNumber(village.households)}</p><p className="mt-1 text-xs text-slate-500">Households</p></div><div><p className="text-lg font-bold text-slate-900">{village.areaSqKm || 0}</p><p className="mt-1 text-xs text-slate-500">Area (sq km)</p></div><div><p className="text-lg font-bold text-slate-900">{formatNumber(projects.byStatus?.Completed, '0')}</p><p className="mt-1 text-xs text-slate-500">Completed</p></div></div></section>
        <section className="surface-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">Latest updates from your village</p></div><Bell size={19} className="text-slate-400" /></div><div className="mt-5 space-y-4">{activities?.length ? activities.slice(0, 5).map((activity) => <div key={activity.id} className="flex gap-3"><span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={15} /></span><div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{activity.title}</p><p className="truncate text-xs text-slate-500">{activity.description}</p><p className="mt-1 text-[11px] text-slate-400">{timeAgo(activity.timestamp)}</p></div></div>) : <p className="py-8 text-center text-sm text-slate-500">No recent activity yet.</p>}</div></section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-display text-lg font-bold text-slate-900">Recent projects</h2><p className="mt-1 text-xs text-slate-500">Development work in progress</p></div><FolderKanban size={19} className="text-slate-400" /></div>{projects.recent?.length ? <div className="divide-y divide-slate-100">{projects.recent.slice(0, 5).map((project) => <div key={project._id} className="flex items-center gap-3 px-5 py-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-800">{project.name}</p><CategoryBadge category={project.category} /></div><div className="mt-2 flex items-center gap-3"><ProgressBar value={project.progress} size="xs" className="max-w-32" showLabel /><StatusBadge status={project.status} /></div></div></div>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No projects have been added yet.</p>}</section>
        <section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-display text-lg font-bold text-slate-900">Complaint queue</h2><p className="mt-1 text-xs text-slate-500">Citizen issues needing attention</p></div><FileWarning size={19} className="text-slate-400" /></div>{complaints.recent?.length ? <div className="divide-y divide-slate-100">{complaints.recent.slice(0, 5).map((complaint) => <div key={complaint._id} className="flex items-center gap-3 px-5 py-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{complaint.title}</p><p className="mt-1 text-xs text-slate-500">{complaint.ticketCode} · {formatDate(complaint.createdAt)}</p></div><StatusBadge status={complaint.status} kind="complaint" /></div>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No complaints have been recorded.</p>}</section>
      </div>
      {user.role === 'Citizen' ? <p className="text-center text-xs text-slate-400">You are viewing public development information for this village.</p> : null}
    </div>
  );
}

function AuthenticatedApp() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const villages = useVillageStore((state) => state.villages);
  const selectedVillageId = useVillageStore((state) => state.selectedVillageId);
  const selectVillage = useVillageStore((state) => state.selectVillage);
  const loadVillages = useVillageStore((state) => state.loadVillages);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeVillageId = selectedVillageId || user?.villageId?._id || user?.villageId;

  useEffect(() => {
    loadVillages({ preferredVillageId: user?.villageId?._id || user?.villageId || null });
  }, [loadVillages, user]);

  const loadDashboard = () => {
    if (!activeVillageId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    statisticsApi.dashboard(activeVillageId)
      .then((response) => setDashboard(response.data))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, [activeVillageId]);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('sv:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('sv:unauthorized', handleUnauthorized);
  }, [clearSession]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} villages={villages} selectedVillageId={activeVillageId} onVillageChange={selectVillage} onLogout={clearSession} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[73px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
          <div className="ml-auto flex items-center gap-3"><button type="button" onClick={loadDashboard} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Refresh dashboard"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button><div className="hidden h-7 w-px bg-slate-200 sm:block" /><Avatar name={user.name} size="sm" /><span className="hidden text-sm font-semibold text-slate-700 sm:block">{firstName(user.name)}</span></div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Dashboard user={user} dashboard={dashboard} loading={loading} error={error} onRetry={loadDashboard} /></main>
      </div>
    </div>
  );
}

export default function App() {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  if (initializing && !user) return <PageLoader label="Restoring your session…" />;
  return <><ToastContainer />{user ? <AuthenticatedApp /> : <LoginScreen />}</>;
}
