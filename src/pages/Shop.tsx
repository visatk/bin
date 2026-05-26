import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Crown, Clock, Flame, ShieldCheck, Copy, CheckCircle2, PackageX } from 'lucide-react';
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

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  
  const filteredItems = items.filter(item => 
    (filter === 'All' || item.category === filter) &&
    item.title.toLowerCase().includes(search.toLowerCase())
  );

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

  const renderPrice = (basePrice: number) => {
    if (!user?.isVip) {
      return (
        <span className="text-xl font-black text-white" aria-label={`${basePrice} Points`}>
          {basePrice} <span className="text-sm text-blue-400 font-bold" aria-hidden="true">PTS</span>
        </span>
      );
    }
    
    const discountedPrice = Math.floor(basePrice * 0.85);
    return (
      <div className="flex flex-col items-end leading-none">
        <span className="text-xs text-slate-500 line-through font-medium" aria-label={`Original price ${basePrice} Points`}>
          {basePrice} PTS
        </span>
        <span className="text-xl font-black text-amber-400 mt-1" aria-label={`VIP price ${discountedPrice} Points`}>
          {discountedPrice} <span className="text-sm text-amber-500/70 font-bold" aria-hidden="true">PTS</span>
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 lg:p-10 xl:p-12 pb-24 lg:pb-32 animate-in fade-in duration-300 w-full max-w-7xl mx-auto">
      
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border border-blue-500/30 p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(37,99,235,0.2)]">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Visatk <ShieldCheck className="text-blue-400" size={28} aria-hidden="true" />
          </h1>
          <p className="text-slate-300 mt-2 max-w-md text-sm md:text-base font-medium">
            Bins, Methods, CC, Fullz, Proxy premium tools and more.
          </p>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
      </header>

      {/* Semantic Controls */}
      <nav aria-label="Marketplace Filters" className="flex flex-col md:flex-row gap-4 items-center sticky top-0 z-40 bg-[#0a0c10]/90 backdrop-blur-2xl py-4 md:py-5 rounded-b-2xl border-b border-slate-800/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="relative w-full md:w-auto flex-1">
          <label htmlFor="search-assets" className="sr-only">Search assets</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input 
            id="search-assets"
            placeholder="Search by ID or description..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#11141d] border-slate-700 text-white focus-visible:ring-blue-500 h-11 rounded-xl shadow-inner"
          />
        </div>
        <div 
          role="tablist" 
          aria-label="Filter Categories"
          className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar scroll-smooth"
        >
          {categories.map(cat => (
            <Button 
              key={cat} 
              role="tab"
              aria-selected={filter === cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={`rounded-xl whitespace-nowrap transition-all font-bold h-10 px-5 ${
                filter === cat 
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                  : 'bg-[#11141d] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </nav>

      {/* Dynamic Grid with aria-live for screen readers */}
      <div aria-live="polite" className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-[#11141d] rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <PackageX size={32} className="text-slate-500" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">No assets match criteria</h3>
            <p className="text-slate-400 text-sm mt-1">Adjust search parameters or categorization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => (
              <article key={item.id} className="group relative flex flex-col bg-[#11141d] border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)] hover:-translate-y-1.5 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                
                {item.isVipExclusive && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 z-10 shadow-lg">
                    <Crown size={12} className="animate-pulse" aria-hidden="true" /> 
                    <span>VIP ONLY</span>
                  </div>
                )}
                
                <header className="flex justify-between items-start mb-4 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0" aria-hidden="true">
                      {item.badge || '📦'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <Badge variant="secondary" className="mt-2 bg-slate-800 text-slate-300 text-[10px] uppercase font-bold px-2 py-0.5">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </header>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-medium mt-2 bg-black/40 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="flex items-center gap-1.5" title={`Listed on ${item.date}`}>
                    <Clock size={14} className="text-blue-400/80" aria-hidden="true"/> 
                    <span className="sr-only">Date listed: </span>{item.date}
                  </span>
                  <span className="w-px h-3 bg-slate-700"></span>
                  <span className="flex items-center gap-1.5" title={`${item.soldCount} copies procured`}>
                    <Flame size={14} className="text-orange-500/80" aria-hidden="true"/> 
                    <span className="sr-only">Amount sold: </span>{item.soldCount}
                  </span>
                </div>

                <footer className="mt-auto flex items-end justify-between border-t border-slate-800/80 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                      {user?.isVip ? 'VIP Valuation' : 'Valuation'}
                    </span>
                    {renderPrice(item.priceCredits)}
                  </div>
                  
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={purchasingIds[item.id] || (item.isVipExclusive && !user?.isVip)}
                    aria-label={`Purchase ${item.title} for ${item.priceCredits} points`}
                    className={`rounded-xl font-bold transition-all duration-300 h-10 px-4 shadow-lg hover:-translate-y-0.5 active:scale-95 ${
                      item.isVipExclusive && !user?.isVip 
                        ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed hover:translate-y-0'
                        : item.isVipExclusive 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20 hover:shadow-amber-500/40' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:shadow-blue-500/40'
                    }`}
                  >
                    {purchasingIds[item.id] ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/>
                        Processing
                      </span>
                    ) : (
                      <>
                        <ShoppingCart size={16} className={item.isVipExclusive && !user?.isVip ? '' : 'mr-2'} aria-hidden="true" /> 
                        {item.isVipExclusive && !user?.isVip ? 'Locked' : 'Purchase'}
                      </>
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
        <DialogContent className="bg-[#0a0c10] border border-slate-800 text-white sm:max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2 text-xl font-black">
              <CheckCircle2 size={24} aria-hidden="true" /> Purchase Complete
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2 text-sm">
              You have successfully purchased <span className="text-white font-bold">{revealedAsset?.title}</span>. Your asset is ready below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative group mt-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-emerald-500/50 rounded-xl blur-md opacity-20 transition duration-500 pointer-events-none" aria-hidden="true"></div>
            <div className="relative bg-[#11141d] p-4 rounded-xl font-mono text-sm text-emerald-400 break-all border border-slate-700 min-h-[120px] pr-14 shadow-inner overflow-hidden selection:bg-emerald-500/30">
              {revealedAsset?.data}
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2 h-9 w-9 bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-colors backdrop-blur-sm" 
                onClick={() => {
                  navigator.clipboard.writeText(revealedAsset?.data || '');
                  toast.success('Copied to clipboard.');
                }}
                aria-label="Copy payload to clipboard"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-6 sm:justify-center">
            <Button onClick={() => setRevealedAsset(null)} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700">
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
