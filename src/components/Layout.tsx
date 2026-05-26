import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Wallet, Crown, ShieldPlus, Coins, LogOut, Hexagon, Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home', prefetch: () => import('@/pages/Dashboard') },
    { path: '/', icon: ShoppingCart, label: 'Shop', prefetch: () => import('@/pages/Shop') },
    { path: '/topup', icon: Wallet, label: 'Topup', prefetch: () => import('@/pages/Topup') },
    { path: '/vip', icon: Crown, label: 'VIP', prefetch: () => import('@/pages/VIP') },
    { path: '/earn', icon: Coins, label: 'Earn', prefetch: () => import('@/pages/Earn') },
    { path: '/withdraw', icon: Landmark, label: 'Withdraw', prefetch: () => import('@/pages/Withdraw') },
  ];

  if (user?.isAdmin) {
    navItems.push({ path: '/admin', icon: ShieldPlus, label: 'Command Center', prefetch: () => import('@/pages/Admin') });
  }

  const DesktopNavLinks = () => (
    <ul className="flex flex-col gap-2 w-full m-0 p-0 list-none" aria-label="Main Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/shop');
        
        return (
          <li key={item.path} className="w-full">
            <Link 
              to={item.path}
              onMouseEnter={() => item.prefetch && item.prefetch()}
              onFocus={() => item.prefetch && item.prefetch()}
              className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl transition-all"
              aria-current={isActive ? 'page' : undefined}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                tabIndex={-1} // Let the Link handle the focus
                className={`w-full justify-start h-12 transition-all duration-200 border-transparent ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)] font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-semibold'
                }`}
              >
                <Icon size={20} className={`mr-3 shrink-0 ${isActive ? 'text-blue-500' : ''}`} aria-hidden="true" />
                <span>{item.label}</span>
                {item.path === '/vip' && user?.isVip && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" aria-hidden="true" />
                )}
              </Button>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex flex-col md:flex-row selection:bg-blue-500/30 font-sans">
      
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" aria-hidden="true"></div>

      {/* Desktop Sidebar (md and up) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#11141d]/80 backdrop-blur-2xl border-r border-slate-800/80 p-6 sticky top-0 h-screen z-40 shadow-[10px_0_40px_rgba(0,0,0,0.5)]">
        
        {/* System Branding */}
        <header className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
            <Hexagon size={24} className="text-white fill-white/10" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">BIN<span className="text-blue-500">SHOP</span></h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Secure Network</p>
          </div>
        </header>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <DesktopNavLinks />
        </nav>

        {/* Identity & Disconnect */}
        <footer className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="px-4 py-3.5 rounded-xl bg-[#0a0c10] border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Identity</span>
              <span className="text-sm font-bold text-slate-200 truncate max-w-[120px]" title={user?.username}>
                @{user?.username}
              </span>
            </div>
            {user?.isVip && (
              <div title="VIP Clearance Active" aria-label="VIP Clearance Active">
                <Crown size={18} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            onClick={logout} 
            aria-label="Secure Disconnect"
            className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-11 border border-transparent hover:border-rose-500/20 font-bold transition-all"
          >
            <LogOut size={18} className="mr-3" aria-hidden="true" /> Secure Disconnect
          </Button>
        </footer>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative max-w-full overflow-hidden pb-[80px] md:pb-0 z-10">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-10 scroll-smooth">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (Thumb Zone) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0c10]/95 backdrop-blur-2xl border-t border-slate-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] z-50 shadow-[0_-10px_50px_rgba(0,0,0,0.8)]"
      >
        <ul className="flex justify-around items-center h-[68px] px-1 m-0 list-none overflow-x-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/shop');
            
            return (
              <li key={item.path} className="flex-1 h-full min-w-[64px]">
                <Link 
                  to={item.path} 
                  onMouseEnter={() => item.prefetch && item.prefetch()}
                  onTouchStart={() => item.prefetch && item.prefetch()}
                  // WCAG 2.5.5: Minimum 44x44px target size enforced via full height/width block
                  className="flex flex-col items-center justify-center h-full w-full relative outline-none focus-visible:bg-white/5 rounded-lg transition-colors group"
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                >
                  {isActive && (
                    <div 
                      className="absolute top-0 w-10 h-1 bg-blue-500 rounded-b-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" 
                      aria-hidden="true" 
                    />
                  )}
                  <div className="relative">
                    <Icon 
                      size={22} 
                      className={`mb-1 transition-colors ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`} 
                      aria-hidden="true"
                    />
                    {item.path === '/vip' && user?.isVip && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border-2 border-[#0a0c10]" aria-hidden="true" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.label.split(' ')[0]} {/* Shortens label for mobile */}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
    </div>
  );
}
