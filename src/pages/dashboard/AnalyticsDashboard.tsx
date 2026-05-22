import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Activity, Zap, Download, Layout, Calendar,
  BrainCircuit, Star, Loader2, Sparkles, X
} from 'lucide-react';
import { analyticsApi, AnalyticsDashboardData } from '../../api/analytics.api';
import { PageTransition } from '../../components/ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const COLORS = ['hsl(var(--primary))', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string[] | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAIInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const res = await analyticsApi.getInsights();
      setInsights(res);
    } catch {
      toast.error('Failed to generate insights');
    } finally {
      setIsInsightsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (!data) return null;

  const pieData = [
    { name: 'Bullet Rewrite', value: data.aiBreakdown.bulletRewrite },
    { name: 'Summary Rewrite', value: data.aiBreakdown.summaryRewrite },
    { name: 'AI Coach', value: data.aiBreakdown.coach },
    { name: 'Tailor', value: data.aiBreakdown.tailor },
  ].filter(d => d.value > 0);

  const aiProgress = Math.min((data.aiCredits.used / data.aiCredits.total) * 100, 100);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your progress, AI usage, and resume optimization metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-2xl">
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">{data.currentPlan} Plan</span>
            </div>
            <button
              onClick={handleGetAIInsights}
              disabled={isInsightsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm group disabled:opacity-50"
            >
              {isInsightsLoading
                ? <Loader2 size={18} className="animate-spin text-primary-500" />
                : <Sparkles size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
              }
              <span className="text-sm font-bold text-foreground">AI Insights</span>
            </button>
          </div>
        </div>

        {/* Insights Modal */}
        <AnimatePresence>
          {insights && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setInsights(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-[2.5rem] border border-border shadow-2xl z-[101] overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="text-primary-500" size={20} />
                      </div>
                      <h3 className="text-xl font-black text-foreground">Performance Insights</h3>
                    </div>
                    <button onClick={() => setInsights(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 p-4 bg-secondary rounded-2xl border border-border"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={() => setInsights(null)}
                    className="w-full mt-8 py-4 btn btn-primary font-bold rounded-2xl"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Resumes Created', value: data.resumeCount, icon: Layout, color: 'text-primary-500', bg: 'bg-primary-500/10' },
            { label: 'PDF Exports', value: data.exportCount, icon: Download, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'AI Operations', value: data.aiCredits.used, icon: BrainCircuit, color: 'text-primary-500', bg: 'bg-primary-500/10' },
            { label: 'Match History', value: data.scoreHistory.length, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-card transition-all">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Optimization Progress</h3>
                <p className="text-xs text-muted-foreground font-medium">Your ATS scores across recent analysis sessions</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Calendar size={12} /> Last 20 Sessions
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.scoreHistory}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent-primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent-primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--accent-primary))' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--accent-primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Credits + Pie */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Credits */}
            <div className="p-8 rounded-[2.5rem] text-[hsl(var(--btn-primary-text))] shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
              <div className="flex items-center gap-2 mb-6">
                <Zap size={20} className="text-[hsl(var(--btn-primary-text))]/80" />
                <h3 className="text-sm font-black uppercase tracking-widest">AI Credits</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-black">{data.aiCredits.total - data.aiCredits.used}</div>
                  <div className="text-xs font-bold opacity-60 mb-1">REMAINING</div>
                </div>
                <div className="w-full h-2.5 bg-[hsl(var(--btn-primary-text))]/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiProgress}%` }}
                    className="h-full bg-[hsl(var(--btn-primary-text))]/80 rounded-full"
                  />
                </div>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                  Resets {new Date(data.aiCredits.resetDate).toLocaleDateString()}
                </p>
              </div>
              {data.currentPlan === 'free' && (
                <button className="w-full mt-6 py-3 bg-[hsl(var(--btn-primary-text))]/20 hover:bg-[hsl(var(--btn-primary-text))]/30 text-[hsl(var(--btn-primary-text))] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm">
                  <Star size={14} /> Upgrade to Pro
                </button>
              )}
            </div>

            {/* AI Pie */}
            <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 text-center">AI Usage Breakdown</h3>
              {pieData.length > 0 ? (
                <>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px', color: 'hsl(var(--foreground))' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-semibold text-muted-foreground">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  No AI usage yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Activity size={20} className="text-primary-500" />
            <h3 className="text-lg font-black text-foreground tracking-tight">Recent Activity</h3>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="_id" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '10px', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent-primary))" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
