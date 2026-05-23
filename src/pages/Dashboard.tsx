import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Bell, ShieldCheck, Activity, Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Requires shadcn skeleton component
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-6xl mx-auto w-full">
      <header className="flex flex-col gap-1 focus-visible:outline-none" tabIndex={-1}>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-300 text-sm">Welcome back, <span className="text-white font-semibold">@{user?.username}</span>.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Balance Card - Contrast & Hierarchy Optimized */}
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
                  <h3 className="text-lg font-bold text-white">Secure Vault</h3>
                  <p className="text-sm text-slate-400">Your procured digital assets</p>
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
                  <p className="font-medium text-base">Vault is currently empty</p>
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
                        {revealedAssets[i] ? 'Mask Asset' : 'Reveal Asset'}
                      </Button>
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

// Cognitive Load Reduction Components
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-pulse">
    <div>
      <Skeleton className="h-10 w-48 mb-2 bg-slate-800" />
      <Skeleton className="h-4 w-64 bg-slate-800" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Skeleton className="lg:col-span-7 h-64 rounded-3xl bg-slate-800" />
      <Skeleton className="lg:col-span-5 h-96 rounded-3xl bg-slate-800" />
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
