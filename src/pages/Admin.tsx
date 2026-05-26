import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, PlusCircle, Megaphone, Trash2, LayoutDashboard, Radio, Package, Edit2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type TabState = 'assets' | 'topups' | 'broadcasts' | 'withdrawals';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabState>('assets');
  
  const [bins, setBins] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Bin Form State
  const [editingBinId, setEditingBinId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [flag, setFlag] = useState('');
  const [assetData, setAssetData] = useState('');
  const [isVipExclusive, setIsVipExclusive] = useState(false);

  // Announcement Form State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsType, setNewsType] = useState('update');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [binsRes, topupsRes, newsRes, withdrawRes] = await Promise.all([
        fetch('/api/admin/bins'),
        fetch('/api/admin/topups'),
        fetch('/api/admin/announcements'),
        fetch('/api/admin/withdrawals')
      ]);
      if (binsRes.ok) setBins(await binsRes.json());
      if (topupsRes.ok) setTopups(await topupsRes.json());
      if (newsRes.ok) setAnnouncements(await newsRes.json());
      if (withdrawRes.ok) setWithdrawals(await withdrawRes.json());
    } catch (e) {
      console.error('Edge state synchronization failed:', e);
      toast.error('Network synchronization failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- ASSET OPERATIONS ---
  const handleEditInit = (bin: any) => {
    setEditingBinId(bin.id);
    setTitle(bin.title);
    setCategory(bin.category);
    setPrice(bin.priceCredits.toString());
    setFlag(bin.badge || '');
    setAssetData(bin.assetData);
    setIsVipExclusive(bin.isVipExclusive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBinId(null);
    setTitle(''); setCategory(''); setPrice(''); setFlag(''); setAssetData(''); setIsVipExclusive(false);
  };

  const handlePostBin = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingBinId ? `/api/admin/bins/${editingBinId}` : '/api/admin/bins';
    const method = editingBinId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, priceCredits: Number(price), badge: flag, assetData, isVipExclusive }),
    });

    if (res.ok) {
      toast.success(editingBinId ? 'Asset ledger updated' : 'Asset deployed to network');
      handleCancelEdit();
      await fetchAdminData();
    } else {
      toast.error('Edge commit failed');
    }
  };

  const handleDeleteBin = async (id: number) => {
    if (!window.confirm('CRITICAL ACTION: Purging an asset may orphan purchase records. Proceed?')) return;
    
    const res = await fetch(`/api/admin/bins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Asset permanently purged from edge');
      setBins(bins.filter(b => b.id !== id));
    } else {
      toast.error('Purge failed');
    }
  };

  // --- TOPUP OPERATIONS ---
  const handleResolveTopup = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/topups/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      toast.success(`Transaction ${action}d securely`);
      setTopups(topups.filter(t => t.id !== id));
    } else {
      toast.error('Failed to resolve transaction');
    }
  };

  // --- WITHDRAWAL OPERATIONS ---
  const handleResolveWithdrawal = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/withdrawals/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      toast.success(`Withdrawal ${action}d securely`);
      setWithdrawals(withdrawals.filter(w => w.id !== id));
    } else {
      toast.error('Failed to resolve withdrawal');
    }
  };

  // --- ANNOUNCEMENT OPERATIONS ---
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle) return;
    
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newsTitle, type: newsType }),
    });

    if (res.ok) {
      toast.success('Network broadcast deployed');
      setNewsTitle('');
      await fetchAdminData();
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Broadcast revoked from edge');
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'event': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl shadow-inner">
            <LayoutDashboard className="text-blue-500" size={28} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Command Center</h1>
            <p className="text-sm text-slate-400 font-medium">Platform Logistics & Network Moderation</p>
          </div>
        </div>

        <nav role="tablist" aria-label="Admin Sections" className="flex gap-2 bg-[#11141d] p-1.5 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {(['assets', 'topups', 'withdrawals', 'broadcasts'] as TabState[]).map((tab) => (
            <button 
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeTab === tab 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab === 'assets' && <Package size={16} aria-hidden="true" />}
              {tab === 'topups' && (
                <div className="relative flex items-center">
                  <Radio size={16} aria-hidden="true" />
                  {topups.length > 0 && <span className="absolute -top-1 -right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true" />}
                </div>
              )}
              {tab === 'withdrawals' && (
                <div className="relative flex items-center">
                  <Landmark size={16} aria-hidden="true" />
                  {withdrawals.length > 0 && <span className="absolute -top-1 -right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />}
                </div>
              )}
              {tab === 'broadcasts' && <Megaphone size={16} aria-hidden="true" />}
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main role="tabpanel" aria-label={`${activeTab} panel`} className="mt-2">
        
        {/* --- ASSETS TAB --- */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4">
              <section className={`bg-gradient-to-b ${editingBinId ? 'from-indigo-900/30 to-[#11141d] border-indigo-500/40' : 'from-[#171a23] to-[#11141d] border-slate-800'} border rounded-3xl p-6 shadow-xl transition-all sticky top-24`}>
                <header className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    {editingBinId ? <Edit2 size={20} className="text-indigo-400" aria-hidden="true" /> : <PlusCircle size={20} className="text-blue-500" aria-hidden="true" />}
                    <h2>{editingBinId ? 'Modify Asset' : 'Deploy Asset'}</h2>
                  </div>
                  {editingBinId && (
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-400 hover:text-white h-8 px-3 rounded-lg">Cancel</Button>
                  )}
                </header>
                
                <form onSubmit={handlePostBin} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="asset-title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Title</Label>
                    <Input id="asset-title" placeholder="e.g. Premium Access Key" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-[#0a0c10] border-slate-700 h-11 rounded-xl focus-visible:ring-blue-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset-category" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</Label>
                      <Input id="asset-category" placeholder="e.g. Keys" value={category} onChange={(e) => setCategory(e.target.value)} required className="bg-[#0a0c10] border-slate-700 h-11 rounded-xl focus-visible:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asset-price" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost (PTS)</Label>
                      <Input id="asset-price" type="number" min="0" placeholder="50" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-[#0a0c10] border-slate-700 h-11 rounded-xl font-mono focus-visible:ring-blue-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="asset-badge" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Badge (Emoji)</Label>
                    <Input id="asset-badge" placeholder="e.g. 🔑" value={flag} onChange={(e) => setFlag(e.target.value)} className="bg-[#0a0c10] border-slate-700 h-11 rounded-xl focus-visible:ring-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-payload" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Encrypted Payload (Post-Purchase)</Label>
                    <textarea id="asset-payload" placeholder="Data to reveal to user..." value={assetData} onChange={(e) => setAssetData(e.target.value)} required className="w-full bg-[#0a0c10] border border-slate-700 rounded-xl p-3 text-sm h-32 text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none custom-scrollbar" />
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border border-slate-800 rounded-xl bg-[#0a0c10]/50 mt-2">
                    <input id="asset-vip" type="checkbox" checked={isVipExclusive} onChange={(e) => setIsVipExclusive(e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-black accent-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer" />
                    <Label htmlFor="asset-vip" className="font-bold text-amber-500/90 cursor-pointer">Restrict to VIP Clearance Only</Label>
                  </div>
                  
                  <Button type="submit" className={`w-full h-12 text-md font-bold rounded-xl mt-2 active:scale-95 transition-transform ${editingBinId ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_5px_20px_rgba(79,70,229,0.3)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_5px_20px_rgba(37,99,235,0.3)]'}`}>
                    {editingBinId ? 'Commit Modifications' : 'Initialize Deployment'}
                  </Button>
                </form>
              </section>
            </div>

            <div className="xl:col-span-8">
              <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col min-h-[600px]">
                <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                  <h2 className="text-white font-bold flex items-center gap-2 text-xl">
                    <Package size={22} className="text-slate-400" aria-hidden="true" /> Distributed Ledger
                  </h2>
                  <Badge variant="outline" className="bg-slate-900 text-slate-300 border-slate-700 py-1 px-3 text-sm">
                    {bins.length} Objects
                  </Badge>
                </header>

                <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {isLoading ? (
                     <div className="flex justify-center items-center h-full text-blue-500">
                       <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/>
                     </div>
                  ) : bins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <Package size={48} className="mb-4 opacity-20" aria-hidden="true" />
                      <p className="font-medium">Ledger is empty. Awaiting deployment.</p>
                    </div>
                  ) : (
                    bins.map((bin) => (
                      <article key={bin.id} className="bg-[#171a23] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:border-blue-500/40 transition-colors focus-within:ring-2 focus-within:ring-blue-500">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
                            {bin.badge || '📦'}
                          </div>
                          <div>
                            <h3 className="text-slate-100 font-bold flex items-center gap-2 text-base">
                              {bin.title}
                              {bin.isVipExclusive && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 py-0 text-[10px]">VIP</Badge>}
                            </h3>
                            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                              <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">{bin.category}</span>
                              <span className="text-blue-400">{bin.priceCredits} PTS</span>
                              <span className="text-slate-500">Vol: {bin.soldCount || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" onClick={() => handleEditInit(bin)} className="flex-1 sm:flex-none bg-slate-900 border-slate-700 hover:bg-indigo-500/20 hover:text-indigo-400 h-9 font-semibold">
                            <Edit2 size={14} className="sm:mr-2" aria-hidden="true" /> <span className="hidden sm:inline">Modify</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBin(bin.id)} className="flex-1 sm:flex-none bg-slate-900 border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 h-9 font-semibold">
                            <Trash2 size={14} className="sm:mr-2" aria-hidden="true" /> <span className="hidden sm:inline">Purge</span>
                          </Button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* --- TOPUPS TAB --- */}
        {activeTab === 'topups' && (
          <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto w-full min-h-[600px] flex flex-col">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3 text-white font-bold text-xl">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Radio size={24} className="text-orange-500 animate-pulse" aria-hidden="true" />
                </div>
                <h2>Transaction Verification Queue</h2>
              </div>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1.5 text-sm font-black tracking-widest">
                {topups.length} PENDING
              </Badge>
            </header>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {isLoading ? (
                 <div className="flex justify-center py-20 text-blue-500"><div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/></div>
              ) : topups.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/50 h-full">
                  <Check size={48} className="text-slate-700 mb-4" aria-hidden="true" />
                  <p className="text-slate-400 font-medium text-lg">Queue is currently optimal.</p>
                  <p className="text-slate-500 text-sm mt-1">No pending transactions require authorization.</p>
                </div>
              ) : (
                topups.map((topup) => (
                  <article key={topup.id} className="bg-[#171a23] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 hover:border-slate-600 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                          Initiator: <span className="text-white font-bold bg-slate-900 px-3 py-1 rounded-md border border-slate-800">@{topup.username}</span>
                        </p>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blockchain TX Hash:</span>
                          <code className="text-sm text-blue-400 bg-[#0a0c10] border border-blue-500/20 px-3 py-2 rounded-lg break-all font-mono shadow-inner">
                            {topup.txHash}
                          </code>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap bg-[#0a0c10] px-5 py-3 rounded-xl border border-slate-800 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <p className="text-3xl font-black text-emerald-400">+{topup.creditsToAdd}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{topup.currency}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4 border-t border-slate-800/80">
                      <Button onClick={() => handleResolveTopup(topup.id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.2)] h-12 font-bold text-base active:scale-95 transition-transform">
                        <Check size={20} className="mr-2" aria-hidden="true" /> Authorize
                    </Button>
                      <Button onClick={() => handleResolveTopup(topup.id, 'reject')} variant="outline" className="flex-1 bg-slate-900 hover:bg-rose-500/10 text-rose-400 border-slate-700 hover:border-rose-500/30 h-12 font-bold text-base active:scale-95 transition-transform">
                        <X size={20} className="mr-2" aria-hidden="true" /> Reject
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* --- WITHDRAWALS TAB --- */}
        {activeTab === 'withdrawals' && (
          <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto w-full min-h-[600px] flex flex-col">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3 text-white font-bold text-xl">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Landmark size={24} className="text-emerald-500 animate-pulse" aria-hidden="true" />
                </div>
                <h2>Withdrawal Verification Queue</h2>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-sm font-black tracking-widest">
                {withdrawals.length} PENDING
              </Badge>
            </header>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {isLoading ? (
                 <div className="flex justify-center py-20 text-emerald-500"><div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/></div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/50 h-full">
                  <Check size={48} className="text-slate-700 mb-4" aria-hidden="true" />
                  <p className="text-slate-400 font-medium text-lg">Withdrawal queue is clear.</p>
                  <p className="text-slate-500 text-sm mt-1">No pending payouts require authorization.</p>
                </div>
              ) : (
                withdrawals.map((withdrawal) => (
                  <article key={withdrawal.id} className="bg-[#171a23] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 hover:border-slate-600 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                          Requester: <span className="text-white font-bold bg-slate-900 px-3 py-1 rounded-md border border-slate-800">@{withdrawal.username}</span>
                        </p>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Address (BEP20):</span>
                          <code className="text-sm text-emerald-400 bg-[#0a0c10] border border-emerald-500/20 px-3 py-2 rounded-lg break-all font-mono shadow-inner">
                            {withdrawal.address}
                          </code>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap bg-[#0a0c10] px-5 py-3 rounded-xl border border-slate-800 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <p className="text-3xl font-black text-emerald-400">${withdrawal.amountUsdt.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{withdrawal.amountPts} PTS</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4 border-t border-slate-800/80">
                      <Button onClick={() => handleResolveWithdrawal(withdrawal.id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.2)] h-12 font-bold text-base active:scale-95 transition-transform">
                        <Check size={20} className="mr-2" aria-hidden="true" /> Authorize
                      </Button>
                      <Button onClick={() => handleResolveWithdrawal(withdrawal.id, 'reject')} variant="outline" className="flex-1 bg-slate-900 hover:bg-rose-500/10 text-rose-400 border-slate-700 hover:border-rose-500/30 h-12 font-bold text-base active:scale-95 transition-transform">
                        <X size={20} className="mr-2" aria-hidden="true" /> Reject
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* --- BROADCASTS TAB --- */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
            <section className="bg-gradient-to-b from-[#11141d] to-[#0a0c10] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl h-fit">
              <header className="flex items-center gap-3 mb-6 text-white font-bold text-xl border-b border-slate-800/50 pb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Megaphone size={24} className="text-purple-400" aria-hidden="true" />
                </div>
                <h2>Network Broadcast</h2>
              </header>
              
              <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="news-type" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transmission Priority</Label>
                  <select 
                    id="news-type"
                    value={newsType} 
                    onChange={(e) => setNewsType(e.target.value)} 
                    className="w-full bg-[#171a23] border border-slate-700 text-sm text-slate-200 rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none font-medium cursor-pointer"
                  >
                    <option value="update">Platform Update (Standard)</option>
                    <option value="alert">Security Alert (High)</option>
                    <option value="event">Special Event (Promo)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="news-title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload Message</Label>
                  <textarea 
                    id="news-title"
                    placeholder="Enter broadcast transmission..." 
                    value={newsTitle} 
                    onChange={(e) => setNewsTitle(e.target.value)} 
                    required 
                    className="w-full bg-[#171a23] border border-slate-700 rounded-xl p-4 text-sm h-32 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none custom-scrollbar" 
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-14 text-lg shadow-[0_5px_20px_rgba(147,51,234,0.3)] mt-2 active:scale-95 transition-transform">
                  Transmit to Fleet
                </Button>
              </form>
            </section>

            <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl min-h-[500px] flex flex-col">
              <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                <h2 className="text-white font-bold flex items-center gap-3 text-xl">
                  <Radio size={22} className="text-slate-400" aria-hidden="true" /> Active Transmissions
                </h2>
                <Badge variant="outline" className="bg-slate-900 text-slate-400 border-slate-700">
                  {announcements.length} Live
                </Badge>
              </header>
              
              <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                 {isLoading ? (
                   <div className="flex justify-center py-20 text-purple-500"><div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/></div>
                 ) : announcements.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/50 h-full">
                    <p className="text-slate-500 font-medium">No active broadcasts in the network.</p>
                  </div>
                ) : (
                  announcements.map((news) => (
                    <article key={news.id} className="flex justify-between items-start p-5 rounded-2xl bg-[#171a23] border border-slate-800 group hover:border-slate-600 transition-colors gap-4">
                      <div className="flex flex-col gap-3">
                        <Badge variant="outline" className={`${getBadgeColor(news.type)} uppercase text-[10px] font-black tracking-widest w-fit py-0.5 px-2`}>
                          {news.type}
                        </Badge>
                        <span className="text-sm font-medium text-slate-100 leading-relaxed">{news.title}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnnouncement(news.id)} 
                        className="text-slate-500 hover:text-rose-400 transition-colors p-2.5 bg-[#0a0c10] border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl shrink-0"
                        title="Revoke Broadcast"
                        aria-label={`Revoke broadcast: ${news.title}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
