import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Wallet, Crown, ShieldPlus, Coins, LogOut, Hexagon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/', icon: ShoppingCart, label: 'Marketplace' },
    { path: '/topup', icon: Wallet, label: 'Add Funds' },
    { path: '/vip', icon: Crown, label: 'VIP Clearance' },
    { path: '/earn', icon: Coins, label: 'Earn Rewards' },
  ];

  if (user?.isAdmin) {
    navItems.push({ path: '/admin', icon: ShieldPlus, label: 'Command Center' });
  }

  const NavLinks = () => (
    <div className="flex flex-col gap-2 w-full">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/shop');
        
        return (
          <Link key={item.path} to={item.path} className="w-full">
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={20} className={`mr-3 ${isActive ? 'text-blue-500' : ''}`} />
              <span className="font-semibold">{item.label}</span>
              {item.path === '/vip' && user?.isVip && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex flex-col md:flex-row selection:bg-blue-500/30 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0d1017]/80 backdrop-blur-xl border-r border-slate-800/60 p-6 sticky top-0 h-screen z-40">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Hexagon size={24} className="text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">BIN<span className="text-blue-500">SHOP</span></h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Secure Network</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <NavLinks />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/60 flex flex-col gap-3">
          <div className="px-3 py-3 rounded-xl bg-black/40 border border-slate-800/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Logged in as</span>
              <span className="text-sm font-bold text-slate-200">@{user?.username}</span>
            </div>
            {user?.isVip && (
              <Crown size={16} className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            )}
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11">
            <LogOut size={18} className="mr-3" /> Secure Disconnect
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative max-w-full overflow-hidden pb-20 md:pb-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-10 relative z-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1017]/90 backdrop-blur-xl border-t border-slate-800/60 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-16 px-2 overflow-x-auto">
          {/* FIX: Removed .slice(0,5) so Admins can access Command Center on Mobile */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/shop');
            return (
              <Link key={item.path} to={item.path} className="flex-1 flex flex-col items-center justify-center h-full relative min-w-[64px]">
                {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
                <Icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
