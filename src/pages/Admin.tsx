import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check, X, PlusCircle, Megaphone, Trash2, LayoutDashboard, Radio, Package, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'assets' | 'topups' | 'broadcasts'>('assets');
  
  const [bins, setBins] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
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
    try {
      const [binsRes, topupsRes, newsRes] = await Promise.all([
        fetch('/api/admin/bins'),
        fetch('/api/admin/topups'),
        fetch('/api/admin/announcements')
      ]);
      if (binsRes.ok) setBins(await binsRes.json());
      if (topupsRes.ok) setTopups(await topupsRes.json());
      if (newsRes.ok) setAnnouncements(await newsRes.json());
    } catch (e) {
      console.error('Failed to sync admin state', e);
      toast.error('Network synchronization failed');
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
      toast.success(editingBinId ? 'Asset updated successfully' : 'Asset deployed to edge network');
      handleCancelEdit();
      await fetchAdminData();
    } else {
      toast.error('Failed to commit asset changes');
    }
  };

  const handleDeleteBin = async (id: number) => {
    if (!confirm('Warning: Deleting an asset may fail if it is tied to existing purchase records. Continue?')) return;
    
    const res = await fetch(`/api/admin/bins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Asset purged');
      setBins(bins.filter(b => b.id !== id));
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to delete asset');
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
      toast.success(`Transaction ${action}d successfully`);
      setTopups(topups.filter(t => t.id !== id));
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
      toast.success('Broadcast active across network');
      setNewsTitle('');
      await fetchAdminData();
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Broadcast revoked');
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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <LayoutDashboard className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Command Center</h1>
            <p className="text-sm text-slate-400 font-medium">Platform Operations & Moderation</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-[#13151c] p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('assets')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'assets' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Package size={16} /> Assets
          </button>
          <button 
            onClick={() => setActiveTab('topups')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${activeTab === 'topups' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Radio size={16} /> Topups
            {topups.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
            {topups.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('broadcasts')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'broadcasts' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Megaphone size={16} /> Broadcasts
          </button>
        </div>
      </header>

      {/* --- ASSETS TAB --- */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5">
            <section className={`bg-gradient-to-b ${editingBinId ? 'from-indigo-900/40 to-[#171a23] border-indigo-500/50' : 'from-[#1e2330] to-[#171a23] border-slate-800'} border rounded-2xl p-6 shadow-xl transition-all`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-white font-bold">
                  {editingBinId ? <Edit2 size={20} className="text-indigo-400" /> : <PlusCircle size={20} className="text-blue-500" />}
                  <h2>{editingBinId ? 'Modify Digital Asset' : 'Deploy Digital Asset'}</h2>
                </div>
                {editingBinId && (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-400 hover:text-white h-7 px-2">Cancel</Button>
                )}
              </div>
              
              <form onSubmit={handlePostBin} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Title</label>
                  <Input placeholder="e.g. YouTube Premium 1M" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-black/40 border-slate-700 focus-visible:ring-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <Input placeholder="e.g. Media" value={category} onChange={(e) => setCategory(e.target.value)} required className="bg-black/40 border-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost (CR)</label>
                    <Input type="number" min="0" placeholder="e.g. 50" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-black/40 border-slate-700 font-mono" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Badge / Icon</label>
                  <Input placeholder="e.g. 📺 or 🇺🇸" value={flag} onChange={(e) => setFlag(e.target.value)} className="bg-black/40 border-slate-700" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Encrypted Payload</label>
                  <textarea placeholder="Credentials or Data to reveal on purchase..." value={assetData} onChange={(e) => setAssetData(e.target.value)} required className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-sm h-24 text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none custom-scrollbar" />
                </div>
                
                <label className="flex items-center gap-3 text-slate-300 text-sm p-3 border border-slate-800 rounded-xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer mt-2">
                  <input type="checkbox" checked={isVipExclusive} onChange={(e) => setIsVipExclusive(e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-black accent-amber-500" />
                  <span className="font-medium text-amber-500/90">Restrict to VIP clearance</span>
                </label>
                
                <Button type="submit" className={`w-full h-12 text-md font-bold shadow-lg mt-2 ${editingBinId ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}>
                  {editingBinId ? 'Commit Modifications' : 'Initialize Deployment'}
                </Button>
              </form>
            </section>
          </div>

          <div className="xl:col-span-7">
            <section className="bg-[#171a23] border border-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Package size={20} className="text-slate-400" /> Asset Ledger
                </h2>
                <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700">
                  {bins.length} Total
                </Badge>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[700px]">
                {bins.length === 0 ? (
                  <div className="text-center py-12 text-sm text-slate-600 font-medium border-2 border-dashed border-slate-800 rounded-xl">No assets deployed.</div>
                ) : (
                  bins.map((bin) => (
                    <div key={bin.id} className="bg-[#1e2330] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-blue-500/50 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                          {bin.badge || '📦'}
                        </div>
                        <div>
                          <h4 className="text-slate-200 font-bold flex items-center gap-2 flex-wrap leading-tight">
                            {bin.title}
                            {bin.isVipExclusive && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-1.5 py-0 text-[9px]">VIP</Badge>}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs font-medium">
                            <span className="text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">{bin.category}</span>
                            <span className="text-blue-400">{bin.priceCredits} CR</span>
                            <span className="text-slate-500 hidden sm:inline-block">Sold: {bin.soldCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={() => handleEditInit(bin)} className="flex-1 sm:flex-none bg-slate-800/50 border-slate-700 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30">
                          <Edit2 size={14} className="sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteBin(bin.id)} className="flex-1 sm:flex-none bg-slate-800/50 border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30">
                          <Trash2 size={14} className="sm:mr-2" /> <span className="hidden sm:inline">Purge</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* --- TOPUPS TAB --- */}
      {activeTab === 'topups' && (
        <section className="bg-[#171a23] border border-slate-800 rounded-2xl p-6 shadow-lg max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white font-bold">
              <Radio size={20} className="text-orange-500 animate-pulse" />
              <h2>Transaction Verification Queue</h2>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1 font-bold">
              {topups.length} PENDING
            </Badge>
          </div>

          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {topups.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center border-2 border-dashed border-slate-800 rounded-xl">
                <Check size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">Queue is currently optimal. No pending transactions.</p>
              </div>
            ) : (
              topups.map((topup) => (
                <div key={topup.id} className="bg-[#1e2330] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <p className="text-sm text-slate-300 font-medium mb-1">
                        User: <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">@{topup.username}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">TX Hash:</span>
                        <code className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md break-all">
                          {topup.txHash}
                        </code>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap ml-4 bg-black/40 px-4 py-2 rounded-lg border border-slate-800">
                      <p className="text-2xl font-black text-emerald-400">+{topup.creditsToAdd}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{topup.currency}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2 border-t border-slate-800/80">
                    <Button onClick={() => handleResolveTopup(topup.id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 h-10 font-bold">
                      <Check size={18} className="mr-2" /> Authorize Deposit
                    </Button>
                    <Button onClick={() => handleResolveTopup(topup.id, 'reject')} variant="outline" className="flex-1 bg-transparent hover:bg-rose-500/10 text-rose-400 border-rose-500/30 hover:border-rose-500/50 h-10 font-bold">
                      <X size={18} className="mr-2" /> Reject Fraudulent
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* --- BROADCASTS TAB --- */}
      {activeTab === 'broadcasts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
          <section className="bg-gradient-to-b from-[#1e2330] to-[#171a23] border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-5 text-white font-bold">
              <Megaphone size={20} className="text-purple-500" />
              <h2>Network Broadcast System</h2>
            </div>
            
            <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transmission Type</label>
                <select value={newsType} onChange={(e) => setNewsType(e.target.value)} className="w-full bg-black/40 border border-slate-700 text-sm text-slate-200 rounded-xl h-10 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                  <option value="update">Platform Update</option>
                  <option value="alert">Security Alert</option>
                  <option value="event">Special Event</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload Message</label>
                <textarea placeholder="Enter broadcast transmission..." value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} required className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-sm h-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 shadow-lg shadow-purple-500/20 mt-2">
                Transmit to Fleet
              </Button>
            </form>
          </section>

          <section className="bg-[#171a23] border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2">
              <Radio size={20} className="text-slate-400" /> Active Transmissions
            </h2>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {announcements.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-500 font-medium border-2 border-dashed border-slate-800 rounded-xl">No active broadcasts.</div>
              ) : (
                announcements.map((news) => (
                  <div key={news.id} className="flex justify-between items-start p-4 rounded-xl bg-[#1e2330] border border-slate-800 group hover:border-slate-700 transition-colors gap-4">
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className={`${getBadgeColor(news.type)} uppercase text-[10px] font-black tracking-wider w-fit`}>
                        {news.type}
                      </Badge>
                      <span className="text-sm font-medium text-slate-200 leading-snug">{news.title}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(news.id)} 
                      className="text-slate-500 hover:text-rose-400 transition-colors p-2 bg-black/20 hover:bg-rose-500/10 rounded-lg shrink-0"
                      title="Revoke Broadcast"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
