import { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingCart, Crown, Clock, Flame, ShieldCheck, 
  Copy, CheckCircle2, PackageX, Sparkles, Tag, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Item {
  id: number;
  title: string;
  category: string;
  date: string;
  soldCount: number;
  priceCredits: number;
  badge?: string;
  isVipExclusive: boolean;
}

interface PurchasedAsset {
  title: string;
  data: string;
}

export default function Shop() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [purchasingIds, setPurchasingIds] = useState<Record<number, boolean>>({});
  const [revealedAsset, setRevealedAsset] = useState<PurchasedAsset | null>(null);
  
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/shop/items');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        toast.error("Market synchronization failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);
  
  const filteredItems = useMemo(() => items.filter(item => 
    (filter === 'All' || item.category === filter) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  ), [items, filter, search]);

  const handlePurchase = async (item: Item) => {
    setPurchasingIds(prev => ({ ...prev, [item.id]: true }));
    try {
      const res = await fetch(`/api/shop/purchase/${item.id}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Purchase successful! -${data.pricePaid} PTS`);
        await refreshUser();
        setRevealedAsset({ title: item.title, data: data.assetData });
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (err) {
      toast.error('Network error. Transaction aborted.');
    } finally {
      setPurchasingIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const renderPrice = (item: Item) => {
    const basePrice = item.priceCredits;
    
    if (!user?.isVip) {
      return (
        <div className="flex flex-col items-end leading-none">
          <span className="text-2xl font-black text-white drop-shadow-md">
            {basePrice} <span className="text-sm text-blue-400 font-bold ml-0.5">PTS</span>
          </span>
          {item.isVipExclusive && (
            <span className="text-[10px] text-rose-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
              Locked <ShieldCheck size={10} />
            </span>
          )}
        </div>
      );
    }
    
    const discountedPrice = Math.floor(basePrice * 0.85);
    return (
      <div className="flex flex-col items-end leading-none">
        <span className="text-[11px] text-slate-500 line-through font-bold mb-1">
          {basePrice} PTS
        </span>
        <span className="text-2xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
          {discountedPrice} <span className="text-sm text-amber-500/70 font-bold ml-0.5">PTS</span>
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 lg:p-10 xl:p-12 pb-24 lg:pb-32 animate-in fade-in zoom-in-95 duration-500 w-full max-w-7xl mx-auto">
      
      {/* Hero Header Section */}
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-900 via-[#131b2f] to-[#0d1017] border border-blue-500/30 p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
            Premium Marketplace
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            Visatk <Sparkles className="text-blue-400 animate-pulse" size={32} />
          </h1>
          <p className="text-slate-300 mt-3 text-base md:text-lg font-medium leading-relaxed">
            Exclusive Bins, Methods, CC, Fullz, and Proxy premium tools. Secure your digital assets instantly.
          </p>
        </div>
        
        {/* Dynamic decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
          <ShoppingCart size={180} className="text-white" />
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      </header>

      {/* Floating Glassmorphic Toolbar */}
      <nav aria-label="Marketplace Filters" className="flex flex-col lg:flex-row gap-4 items-center sticky top-4 z-40 bg-[#131722]/80 backdrop-blur-xl p-3 rounded-2xl border border-slate-800/60 shadow-2xl">
        <div className="relative w-full lg:w-96 shrink-0">
          <label htmlFor="search-assets" className="sr-only">Search assets</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            id="search-assets"
            placeholder="Search by keyword or ID..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-black/40 border-slate-700/50 text-white focus-visible:ring-blue-500 h-12 rounded-xl shadow-inner text-base placeholder:text-slate-500 transition-all focus-visible:bg-black/60"
          />
        </div>
        
        <div className="w-[1px] h-8 bg-slate-800/80 hidden lg:block mx-2"></div>

        <div 
          role="tablist" 
          aria-label="Filter Categories"
          className="flex gap-2 overflow-x-auto w-full pb-1 lg:pb-0 custom-scrollbar scroll-smooth pr-2"
        >
          {categories.map(cat => (
            <Button 
              key={cat} 
              role="tab"
              aria-selected={filter === cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={`rounded-xl whitespace-nowrap transition-all duration-300 font-bold h-12 px-6 shrink-0 ${
                filter === cat 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-100' 
                  : 'bg-black/20 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 scale-95 hover:scale-100'
              }`}
            >
              {cat === 'All' ? <Tag size={16} className="mr-2 opacity-70" /> : null}
              {cat}
            </Button>
          ))}
        </div>
      </nav>

      {/* Bento Grid Item Display */}
      <div aria-live="polite" className="min-h-[500px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[280px] w-full bg-slate-800/40 rounded-3xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/20">
            <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
              <PackageX size={40} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-black text-white">No assets found</h3>
            <p className="text-slate-400 text-base mt-2 max-w-sm">
              We couldn't find any items matching your criteria. Try adjusting your search or filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 border-slate-700 text-slate-300 hover:text-white rounded-xl h-12 px-8"
              onClick={() => {setSearch(''); setFilter('All');}}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <article key={item.id} className="group relative flex flex-col bg-[#131722]/60 backdrop-blur-sm border border-slate-800/60 hover:border-blue-500/40 rounded-3xl p-6 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.25)] hover:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 outline-none">
                
                {/* Glowing VIP Badge */}
                {item.isVipExclusive && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-[#131722]">
                    <Crown size={12} /> <span>VIP</span>
                  </div>
                )}
                
                <header className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        {item.badge || '📦'}
                      </div>
                      <Badge variant="secondary" className="bg-slate-900/80 text-slate-300 border border-slate-700/50 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-lg">
                        {item.category}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mt-1">
                      {item.title}
                    </h3>
                  </div>
                </header>

                {/* Meta Data */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-8 font-mono bg-black/30 rounded-xl p-3 border border-slate-800/50 mt-auto">
                  <span className="flex items-center gap-1.5" title={`Listed on ${item.date}`}>
                    <Clock size={14} className="text-blue-500" /> {item.date}
                  </span>
                  <span className="w-px h-4 bg-slate-700/50"></span>
                  <span className="flex items-center gap-1.5" title={`${item.soldCount} copies procured`}>
                    <Flame size={14} className="text-orange-500" /> {item.soldCount} Sold
                  </span>
                </div>

                {/* Footer / Call to Action */}
                <footer className="flex items-end justify-between pt-4 border-t border-slate-800/60">
                  {renderPrice(item)}
                  
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={purchasingIds[item.id] || (item.isVipExclusive && !user?.isVip)}
                    className={`rounded-2xl font-bold transition-all duration-300 h-12 w-12 p-0 flex items-center justify-center shadow-lg group/btn active:scale-90 ${
                      item.isVipExclusive && !user?.isVip 
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed hover:bg-slate-800'
                        : item.isVipExclusive 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-amber-500/25 hover:shadow-amber-500/50' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 hover:shadow-blue-500/50'
                    }`}
                  >
                    {purchasingIds[item.id] ? (
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight size={20} className={item.isVipExclusive && !user?.isVip ? '' : 'group-hover/btn:-rotate-45 transition-transform duration-300'} />
                    )}
                  </Button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Secure Asset Delivery Modal */}
      <Dialog open={!!revealedAsset} onOpenChange={(open) => !open && setRevealedAsset(null)}>
        <DialogContent className="bg-[#0a0c10]/95 backdrop-blur-2xl border border-slate-800 text-white sm:max-w-md shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-3 text-2xl font-black">
              <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              Success!
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-3 text-base leading-relaxed">
              You acquired <span className="text-white font-bold px-1">{revealedAsset?.title}</span>. Your premium asset is ready for use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative group mt-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#11141d] p-5 rounded-2xl font-mono text-sm text-emerald-400 break-all border border-slate-700/80 min-h-[140px] pr-16 shadow-inner overflow-hidden selection:bg-emerald-500/30 leading-relaxed">
              {revealedAsset?.data}
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-3 right-3 h-10 w-10 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all backdrop-blur-md shadow-lg rounded-xl hover:scale-105 active:scale-95" 
                onClick={() => {
                  navigator.clipboard.writeText(revealedAsset?.data || '');
                  toast.success('Copied to secure clipboard.');
                }}
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-8 sm:justify-center">
            <Button 
              onClick={() => setRevealedAsset(null)} 
              className="w-full sm:w-auto bg-white hover:bg-slate-200 text-black font-black rounded-xl h-12 px-8 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Close Secure Viewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
