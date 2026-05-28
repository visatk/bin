import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Bell, ShieldCheck, Activity, Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

interface News {
  id: number;
  title: string;
  type: string;
  createdAt: string;
}

interface Purchase {
  title: string;
  category: string;
  assetData: string;
}

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

    // PERFORMANCE: Parallelize API calls to reduce edge response waterfall
    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        const [newsRes, purchasesRes] = await Promise.all([
          fetch('/api/user/dashboard'),
          fetch('/api/user/purchases')
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-1 focus-visible:outline-none" tabIndex={-1}>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-300 text-sm">Welcome back, <span className="text-white font-semibold">@{user?.username}</span>.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Financials & Vault */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Balance Card */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/50 via-[#131b2f] to-[#0d1017] border border-blue-500/30 p-8 shadow-[0_15px_40px_-15px_rgba(37,99,235,0.25)]">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none" aria-hidden="true">
              <Wallet size={120} className="text-blue-400 transform rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-bold text-blue-200/90 uppercase tracking-widest">Available Balance</h2>
                {user?.isVip && (
                  <Badge aria-label="VIP Status Active" className="bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    VIP ACTIVE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-2 mb-8" aria-label={`Balance is ${(user?.credits ?? 0)} Points`}>
                <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                  {(user?.credits ?? 0).toLocaleString()}
                </span>
                <span className="text-xl text-blue-400 font-bold" aria-hidden="true">PTS</span>
              </div>
              
              <div className="flex gap-4">
                <Link to="/topup" className="flex-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl outline-none">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-12 shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-transform active:scale-95">
                    Deposit Funds
                  </Button>
                </Link>
                <Link to="/" className="flex-1 focus-visible:ring-2 focus-visible:ring-white rounded-xl outline-none">
                  <Button variant="outline" className="w-full bg-white/5 border-white/20 hover:bg-white/15 text-white font-bold rounded-xl h-12 backdrop-blur-md transition-transform active:scale-95">
                    Access Market <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Secure Vault */}
          <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg" aria-hidden="true">
                  <LockKeyhole size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Collection</h3>
                  <p className="text-sm text-slate-400">Your purchased assets</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-black/50 text-slate-300 border-slate-700">
                {purchases.length} Assets
              </Badge>
            </header>
            
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
              {dataLoading ? (
                <VaultSkeletons />
              ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ShieldCheck size={48} className="mb-4 opacity-30" aria-hidden="true" />
                  <p className="font-medium text-base">You haven't made any purchases yet.</p>
                </div>
              ) : (
                purchases.map((p, i) => (
                  <article key={i} className="bg-black/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-colors group focus-within:ring-2 focus-within:ring-emerald-500/50 outline-none">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-100">{p.title}</h4>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                      </div>
                    </div>
                    
                    {/* WCAG Compliant Security Toggle */}
                    <div className="relative mt-2">
                      <div 
                        className={`p-3 rounded-xl border font-mono text-sm break-all transition-all duration-200 ${revealedAssets[i] ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 select-all' : 'bg-slate-900 border-slate-800 text-transparent select-none blur-sm'}`}
                        aria-hidden={!revealedAssets[i]}
                      >
                        {p.assetData}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleReveal(i)}
                        aria-expanded={revealedAssets[i]}
                        aria-controls={`asset-data-${i}`}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-9 px-4 backdrop-blur-md border shadow-lg font-semibold transition-opacity ${revealedAssets[i] ? 'bg-black/60 border-slate-700 text-slate-300 hover:text-white opacity-0 focus:opacity-100 group-hover:opacity-100' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
                      >
                        {revealedAssets[i] ? <EyeOff size={16} className="mr-2" aria-hidden="true" /> : <Eye size={16} className="mr-2" aria-hidden="true" />}
                        {revealedAssets[i] ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Network Activity Feed (Restored) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 shadow-xl h-full flex flex-col">
            <header className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 bg-purple-500/10 rounded-lg" aria-hidden="true">
                <Activity size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recent Updates</h3>
                <p className="text-sm text-slate-400">Latest news and alerts</p>
              </div>
            </header>

            <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {dataLoading ? (
                 <ActivitySkeletons />
              ) : latestNews.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No recent updates.</p>
              ) : (
                latestNews.map((news) => (
                  <article key={news.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#11141d] bg-slate-900 text-slate-500 group-hover:bg-purple-600 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10" aria-hidden="true">
                      <Bell size={14} />
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-[#0a0c10] border border-slate-800/80 hover:border-purple-500/40 transition-colors shadow-sm focus-within:ring-2 focus-within:ring-purple-500 outline-none">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit text-[9px] uppercase font-black tracking-wider ${news.type === 'alert' ? 'bg-red-500/10 text-red-400 border-red-500/20' : news.type === 'event' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {news.type || 'Update'}
                        </Badge>
                        <span className="text-sm font-bold text-slate-100 mt-1">{news.title}</span>
                        <time className="text-[10px] text-slate-500 font-mono mt-2" dateTime={news.createdAt}>
                          {new Date(news.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------------
// Cognitive Load Reduction Components (Skeletons)
// --------------------------------------------------------

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-pulse">
    <div>
      <Skeleton className="h-10 w-48 mb-2 bg-slate-800" />
      <Skeleton className="h-4 w-64 bg-slate-800" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Skeleton className="lg:col-span-7 h-64 rounded-3xl bg-slate-800" />
      <Skeleton className="lg:col-span-5 h-[500px] rounded-3xl bg-slate-800" />
    </div>
  </div>
);

const VaultSkeletons = () => (
  <div className="flex flex-col gap-4">
    {[1, 2].map(i => (
      <Skeleton key={i} className="h-32 w-full rounded-2xl bg-slate-800/50" />
    ))}
  </div>
);

const ActivitySkeletons = () => (
  <div className="flex flex-col gap-6 w-full">
    {[1, 2, 3].map(i => (
      <Skeleton key={i} className="h-24 w-full rounded-2xl bg-slate-800/50" />
    ))}
  </div>
);
