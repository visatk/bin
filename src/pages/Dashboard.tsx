import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Bell, ShieldCheck, Activity, Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [revealedAssets, setRevealedAssets] = useState<Record<number, boolean>>({});

  // Route Protection
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return; // Don't attempt fetch if not logged in

    fetch('/api/user/dashboard')
      .then(r => r.json())
      .then(d => {
        // Safe check for valid data array
        if (d && Array.isArray(d.latestNews)) {
          setLatestNews(d.latestNews);
        }
      })
      .catch(console.error);
      
    fetch('/api/user/purchases')
      .then(r => r.json())
      .then(d => {
        // CRITICAL FIX: Ensure the API returned an array before setting state
        // This prevents the "purchases.map is not a function" crash
        if (Array.isArray(d)) {
          setPurchases(d);
        } else {
          console.error("Purchases API returned non-array:", d);
        }
      })
      .catch(console.error);
  }, [user]);

  const toggleReveal = (id: number) => {
    setRevealedAssets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white/10 border-t-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      
      {/* Header / Greeting */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm">Welcome back <span className="text-slate-200 font-semibold">@{user?.username}</span>.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Financials & Vault */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Balance Card */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 via-[#131b2f] to-[#0d1017] border border-blue-500/20 p-8 shadow-[0_15px_40px_-15px_rgba(37,99,235,0.2)]">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <Wallet size={120} className="text-blue-400 transform rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-semibold text-blue-200/70 uppercase tracking-widest">Balance</p>
                {user?.isVip && (
                  <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-amber-500/20">
                    VIP ACTIVE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-2 mb-8">
                <h2 className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                  {(user?.credits ?? 0).toLocaleString()}
                </h2>
                <span className="text-xl text-blue-400 font-bold">PTS</span>
              </div>
              
              {/* Type-Safe Buttons Encapsulated by Links */}
              <div className="flex gap-4">
                <Link to="/topup" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-12 shadow-[0_5px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all">
                    Deposit Funds
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12 backdrop-blur-md hover:-translate-y-0.5 transition-all">
                    Access Market <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
          </section>

          {/* Secure Vault (Purchases) */}
          <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <LockKeyhole size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Secure Vault</h3>
                  <p className="text-xs text-slate-500">Your procured digital assets</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-black/50 text-slate-400 border-slate-700">
                {purchases.length} Assets
              </Badge>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
              {purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <ShieldCheck size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Vault is currently empty</p>
                  <Link to="/">
                    <Button variant="link" className="text-blue-400 mt-2">
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
              ) : (
                purchases.map((p, i) => (
                  <div key={i} className="bg-black/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">{p.title}</h4>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.category}</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 font-mono">
                        -{p.pricePaid} PTS
                      </Badge>
                    </div>
                    
                    <div className="relative">
                      <div className={`p-3 rounded-xl border font-mono text-sm break-all transition-all duration-300 ${revealedAssets[i] ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300 select-all' : 'bg-slate-900 border-slate-800 text-transparent select-none blur-sm'}`}>
                        {p.assetData}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleReveal(i)}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 backdrop-blur-md border shadow-lg ${revealedAssets[i] ? 'bg-black/40 border-slate-700 text-slate-400 hover:text-white opacity-0 hover:opacity-100' : 'bg-black/60 border-slate-700 text-white'}`}
                      >
                        {revealedAssets[i] ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                        {revealedAssets[i] ? 'Mask Asset' : 'Reveal Asset'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Network Activity */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Updates</h3>
                <p className="text-xs text-slate-500">Live system updates</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {latestNews.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No recent transmissions.</p>
              ) : (
                latestNews.map((news) => (
                  <div key={news.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Timeline Node */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#11141d] bg-slate-800 text-slate-500 group-hover:bg-purple-500 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                      <Bell size={14} />
                    </div>
                    
                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-black/40 border border-slate-800/80 hover:border-purple-500/30 transition-colors shadow-sm">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit text-[9px] uppercase font-black tracking-wider ${news.type === 'alert' ? 'bg-red-500/10 text-red-400 border-red-500/20' : news.type === 'event' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {news.type || 'Update'}
                        </Badge>
                        <span className="text-sm font-bold text-slate-200 mt-1">{news.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-2">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
