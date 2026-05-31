import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, Bell, ShieldCheck, Activity, Eye, EyeOff, 
  LockKeyhole, ArrowRight, LayoutDashboard, Crown, 
  Coins, Landmark, ShieldPlus, Sparkles, TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

// Performance Optimization: Component-Level Lazy Loading
const VIPPanel = lazy(() => import('@/pages/VIP'));
const EarnPanel = lazy(() => import('@/pages/Earn'));
const WithdrawPanel = lazy(() => import('@/pages/Withdraw'));
const SupportPanel = lazy(() => import('@/pages/Support'));

interface News { id: number; title: string; type: string; createdAt: string; }
interface Purchase { title: string; category: string; assetData: string; }

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [revealedAssets, setRevealedAssets] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        const [newsRes, purchasesRes] = await Promise.all([
          fetch('/api/user/dashboard').catch(() => ({ ok: false, json: () => [] })),
          fetch('/api/user/purchases').catch(() => ({ ok: false, json: () => [] }))
        ]);
        
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (Array.isArray(newsData?.latestNews)) setLatestNews(newsData.latestNews);
        }
        if (purchasesRes.ok) {
          const purchaseData = await purchasesRes.json();
          if (Array.isArray(purchaseData)) setPurchases(purchaseData);
        }
      } catch (error) {
        console.error("Edge data retrieval failed:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const toggleReveal = (id: number) => setRevealedAssets(prev => ({ ...prev, [id]: !prev[id] }));

  if (authLoading || !user) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto w-full pb-10">
      {/* Header Section with Live Indicator */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 focus-visible:outline-none" tabIndex={-1}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-500 tracking-wider uppercase">System Online</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Workspace</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Welcome back, <span className="text-slate-200 font-semibold">@{user?.username}</span>. Here's your overview.
          </p>
        </div>
        
        {user?.isVip && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <Crown size={16} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-400">VIP Member</span>
          </div>
        )}
      </header>

      <Tabs defaultValue="overview" className="w-full">
        {/* Premium Tab Navigation */}
        <TabsList className="flex w-full overflow-x-auto custom-scrollbar justify-start sm:grid sm:grid-cols-5 bg-[#131722]/80 backdrop-blur-xl border border-slate-800/60 mb-8 p-2 rounded-3xl h-auto shrink-0 shadow-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3 px-4 font-semibold transition-all shrink-0 text-slate-400 hover:text-slate-200">
            <LayoutDashboard size={18} className="mr-2 hidden sm:block md:hidden lg:block" /> Overview
          </TabsTrigger>
          <TabsTrigger value="vip" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3 px-4 font-semibold transition-all shrink-0 text-slate-400 hover:text-slate-200">
            <Sparkles size={18} className="mr-2 hidden sm:block md:hidden lg:block" /> VIP Center
          </TabsTrigger>
          <TabsTrigger value="earn" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3 px-4 font-semibold transition-all shrink-0 text-slate-400 hover:text-slate-200">
            <TrendingUp size={18} className="mr-2 hidden sm:block md:hidden lg:block" /> Earn
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3 px-4 font-semibold transition-all shrink-0 text-slate-400 hover:text-slate-200">
            <Landmark size={18} className="mr-2 hidden sm:block md:hidden lg:block" /> Withdraw
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3 px-4 font-semibold transition-all shrink-0 text-slate-400 hover:text-slate-200">
            <ShieldPlus size={18} className="mr-2 hidden sm:block md:hidden lg:block" /> Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none m-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Main Balance & Quick Actions */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              {/* Premium Balance Card */}
              <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900 border border-blue-500/30 p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.4)] group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none" aria-hidden="true">
                  <Wallet size={160} className="text-white" />
                </div>
                
                {/* Decorative glowing orb */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>

                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-blue-200/90 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Coins size={16} /> Total Available Balance
                  </h2>
                  <div className="flex items-baseline gap-3 mb-10">
                    <span className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-xl">
                      {(user?.credits ?? 0).toLocaleString()}
                    </span>
                    <span className="text-2xl text-blue-300 font-bold tracking-tight">PTS</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link to="/topup" className="flex-1 sm:flex-none">
                      <Button className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-900 font-bold rounded-2xl h-14 px-8 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 text-base">
                        Deposit Funds
                      </Button>
                    </Link>
                    <Link to="/" className="flex-1 sm:flex-none">
                      <Button variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl h-14 px-8 backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0 text-base">
                        Access Market <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Secure Vault (Bento Box Style) */}
              <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <LockKeyhole size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Secure Vault</h3>
                      <p className="text-sm text-slate-400">Manage your acquired assets</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-black/50 text-slate-300 border-slate-700 px-3 py-1 text-sm rounded-lg">
                    {purchases.length} Items
                  </Badge>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                  {dataLoading ? <VaultSkeletons /> : purchases.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                      <ShieldCheck size={56} className="mb-4 opacity-20" />
                      <p className="font-medium text-lg text-slate-400">Vault is empty</p>
                      <p className="text-sm mt-1">Visit the market to acquire assets.</p>
                    </div>
                  ) : (
                    purchases.map((p, i) => (
                      <article key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:bg-slate-800/50 hover:border-slate-700 transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-slate-100 leading-tight">{p.title}</h4>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-700 uppercase text-[10px] tracking-wider shrink-0 ml-2">
                            {p.category}
                          </Badge>
                        </div>
                        <div className="relative mt-auto pt-4 border-t border-slate-800/50">
                          <div className={`p-4 rounded-2xl border font-mono text-sm break-all transition-all duration-300 ${revealedAssets[i] ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 select-all shadow-inner' : 'bg-black/40 border-slate-800 text-transparent select-none blur-[4px]'}`}>
                            {p.assetData}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleReveal(i)}
                            className={`absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 px-5 rounded-xl backdrop-blur-md border shadow-2xl font-bold transition-all duration-300 ${revealedAssets[i] ? 'bg-black/80 border-slate-700 text-slate-400 hover:text-white opacity-0 focus:opacity-100 group-hover:opacity-100' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:scale-105'}`}
                          >
                            {revealedAssets[i] ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                            {revealedAssets[i] ? 'Hide Key' : 'Reveal Key'}
                          </Button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Activity Feed */}
            <div className="flex flex-col h-full">
              <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl h-full flex flex-col">
                <header className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                    <Activity size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Live Feed</h3>
                    <p className="text-sm text-slate-400">System updates & alerts</p>
                  </div>
                </header>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="relative border-l-2 border-slate-800/60 ml-4 space-y-8 pb-4">
                    {dataLoading ? <ActivitySkeletons /> : latestNews.length === 0 ? (
                      <div className="pl-6 text-slate-500 italic text-sm">No new activities to display.</div>
                    ) : (
                      latestNews.map((news) => (
                        <article key={news.id} className="relative pl-8 group">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-[#131722] flex items-center justify-center transition-colors ${news.type === 'alert' ? 'bg-red-500' : news.type === 'event' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                          
                          <div className="bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700 p-5 rounded-2xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-wider ${news.type === 'alert' ? 'bg-red-500/10 text-red-400 border-red-500/20' : news.type === 'event' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                {news.type || 'Update'}
                              </Badge>
                              <div className="flex items-center text-slate-500 text-[11px] font-mono">
                                <Clock size={12} className="mr-1" />
                                {new Date(news.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-200 mt-2 leading-relaxed">
                              {news.title}
                            </p>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>
            
          </div>
        </TabsContent>

        {/* Dynamic Panels */}
        <Suspense fallback={<DashboardSkeleton />}>
          <TabsContent value="vip" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"><VIPPanel /></TabsContent>
          <TabsContent value="earn" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"><EarnPanel /></TabsContent>
          <TabsContent value="withdraw" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"><WithdrawPanel /></TabsContent>
          <TabsContent value="support" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"><SupportPanel /></TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}

// Advanced Skeletons for smooth loading states
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-pulse pb-10">
    <div>
      <Skeleton className="h-4 w-24 mb-3 bg-slate-800 rounded-full" />
      <Skeleton className="h-12 w-64 mb-3 bg-slate-800 rounded-xl" />
      <Skeleton className="h-5 w-80 bg-slate-800/50 rounded-lg" />
    </div>
    <Skeleton className="h-16 w-full rounded-3xl bg-slate-800/40" />
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 flex flex-col gap-6">
        <Skeleton className="h-[320px] rounded-[2rem] bg-slate-800" />
        <Skeleton className="h-[400px] rounded-[2rem] bg-slate-800/50" />
      </div>
      <Skeleton className="h-full min-h-[500px] rounded-[2rem] bg-slate-800/50" />
    </div>
  </div>
);

const VaultSkeletons = () => (
  <>
    {[1, 2, 3, 4].map(i => (
      <Skeleton key={i} className="h-40 w-full rounded-3xl bg-slate-800/40" />
    ))}
  </>
);

const ActivitySkeletons = () => (
  <>
    {[1, 2, 3].map(i => (
      <div key={i} className="pl-8 mb-8 relative">
        <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-slate-800"></div>
        <Skeleton className="h-28 w-full rounded-2xl bg-slate-800/40" />
      </div>
    ))}
  </>
);
