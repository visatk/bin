import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Crown, Clock, Flame, ShieldCheck, Copy, CheckCircle2, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
    fetch('/api/shop/items')
      .then(r => r.json())
      .then(d => {
        setItems(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        toast.success(`Purchase successful! -${data.pricePaid} CR`);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Asset data copied to clipboard!');
  };

  const renderPrice = (basePrice: number) => {
    if (!user?.isVip) {
      return (
        <span className="text-xl font-black text-white">
          {basePrice} <span className="text-sm text-blue-500 font-bold">CR</span>
        </span>
      );
    }
    
    const discountedPrice = Math.floor(basePrice * 0.85);
    return (
      <div className="flex flex-col items-end leading-none">
        <span className="text-xs text-slate-500 line-through font-medium">{basePrice} CR</span>
        <span className="text-xl font-black text-amber-400 mt-1">
          {discountedPrice} <span className="text-sm text-amber-500/70 font-bold">CR</span>
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 p-6 md:p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Visatk<span className="text-blue-500">.us</span> <ShieldCheck className="text-blue-400" size={28} />
          </h1>
          <p className="text-slate-400 mt-2 max-w-md text-sm md:text-base">
            High-quality, freshly verified digital assets. Updated daily.
          </p>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center sticky top-0 z-40 bg-[#13151c]/90 backdrop-blur-md py-3 rounded-b-xl border-b border-slate-800/50">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input 
            placeholder="Search assets..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1e2330] border-slate-800 text-white focus-visible:ring-blue-500 rounded-xl shadow-inner"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth">
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={`rounded-full whitespace-nowrap transition-all ${filter === cat ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-[#1e2330] border-slate-800 text-slate-300 hover:text-white'}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-[#1e2330] rounded-xl animate-pulse border border-slate-800/50" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <PackageX size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">No assets found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="group relative flex flex-col bg-[#1e2330] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] overflow-hidden">
              
              {item.isVipExclusive && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10 shadow-lg">
                  <Crown size={12} className="animate-pulse" /> VIP EXCLUSIVE
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                    <span aria-hidden="true">{item.badge || '📦'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="mt-1.5 bg-slate-800/60 text-slate-300 text-[10px] uppercase font-bold px-2 py-0">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-medium mt-2 bg-black/20 rounded-lg p-2 border border-slate-800/50">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400/80"/> {item.date}</span>
                <span className="w-px h-3 bg-slate-700"></span>
                <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500/80"/> {item.soldCount} Sold</span>
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-slate-800/60 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                    {user?.isVip ? 'Your VIP Price' : 'Price'}
                  </span>
                  {renderPrice(item.priceCredits)}
                </div>
                
                <Button 
                  onClick={() => handlePurchase(item)}
                  disabled={purchasingIds[item.id] || (item.isVipExclusive && !user?.isVip)}
                  className={`rounded-lg font-bold transition-all shadow-lg ${
                    item.isVipExclusive 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {purchasingIds[item.id] ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing</span>
                  ) : (
                    <><ShoppingCart size={16} className="mr-2" /> Buy Now</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Secure Asset Delivery Modal */}
      <Dialog open={!!revealedAsset} onOpenChange={(open) => !open && setRevealedAsset(null)}>
        <DialogContent className="bg-[#1e2330] border border-slate-700 text-white sm:max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2 text-xl">
              <CheckCircle2 size={24} /> Acquisition Secure
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              You have successfully unlocked <span className="text-slate-200 font-bold">{revealedAsset?.title}</span>. Store this data securely.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative group mt-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#13151c] p-4 rounded-lg font-mono text-sm text-emerald-400 break-all border border-slate-700 min-h-[100px] pr-12 flex items-center shadow-inner">
              {revealedAsset?.data}
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2 h-8 w-8 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-blue-600 transition-colors" 
                onClick={() => copyToClipboard(revealedAsset?.data || '')}
                title="Copy to clipboard"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-6 sm:justify-center">
            <Button onClick={() => setRevealedAsset(null)} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white">
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
