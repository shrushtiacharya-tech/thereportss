import { useState, useEffect } from 'react';
import { Search, Menu, User, X, Zap, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useNewsContext } from '../contexts/NewsContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const today = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className="bg-paper flex flex-col">
      {/* Top Bar - Hidden on Mobile */}
      <div className="hidden md:flex border-b border-border-news/50">
        <div className="news-container py-2 flex justify-between items-center text-[10px] sm:text-[11px] font-medium">
          <div className="flex gap-4 items-center uppercase tracking-wider text-neutral-500">
            <span>{today}</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span className="font-mono">{time}</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full hidden sm:inline" />
            <span className="hidden sm:inline">Mumbai/New Delhi Edition</span>
          </div>
          <div className="flex gap-6 items-center uppercase tracking-wider text-neutral-600 font-bold">
            <Link to="/admin" className="text-news-blue hover:underline">Editorial Portal</Link>
            <button className="hover:text-news-red transition-colors cursor-pointer flex gap-1 items-center">
              <User size={12} /> Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding */}
      <div className="news-container py-6 md:py-10 flex flex-col items-center gap-1">
        <Link to="/" className="flex flex-col items-center group">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black text-[#003366] tracking-tighter uppercase leading-tight text-center">
            The Reports
          </h1>
          <div className="w-full flex items-center gap-4 mt-2 md:mt-4">
            <div className="flex-grow h-[1px] bg-neutral-200" />
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.6em] font-bold text-neutral-500 whitespace-nowrap">
              India's Independent Journal of Record
            </p>
            <div className="flex-grow h-[1px] bg-neutral-200" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="news-container border-t-2 md:border-t-4 border-black border-b border-neutral-200 sticky top-0 bg-paper z-50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 text-neutral-600 hover:text-ink transition-colors cursor-pointer border-r border-neutral-100 pr-4"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          
          <ul className="flex-grow hidden md:flex justify-center items-center py-2 gap-8 lg:gap-12">
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <NavLink 
                  to={`/category/${cat.toLowerCase()}`}
                  className={({ isActive }) => 
                    `text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer pb-1 border-b-2 ${
                      isActive ? 'text-news-blue border-news-blue' : 'text-neutral-500 border-transparent hover:text-news-blue'
                    }`
                  }
                >
                  {cat}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex-grow md:hidden px-4 flex items-center gap-2">
             <div className="h-px w-full bg-neutral-100" />
          </div>

          <div className="flex items-center border-l border-neutral-100 pl-4 bg-white/50 px-2 h-full">
            <button 
              onClick={() => navigate('/')}
              className="p-3 hover:text-news-blue transition-colors cursor-pointer"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-paper z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b-4 border-black flex justify-between items-center bg-[#003366] text-white">
                <span className="text-xs font-black uppercase tracking-[0.3em]">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-10">
                <div className="flex flex-col gap-8">
                  {CATEGORIES.map((cat) => (
                    <Link 
                      key={cat} 
                      to={`/category/${cat.toLowerCase()}`}
                      className="text-3xl font-serif font-black uppercase tracking-tighter text-ink hover:text-news-red transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>

                <div className="h-[2px] bg-black w-12 my-10" />

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#003366]">
                    <Zap size={14} />
                    Breaking News Alerts
                  </div>
                   <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                    <TrendingUp size={14} />
                    Market Indicators
                  </div>
                  <Link to="/admin" className="p-4 bg-neutral-100 border border-neutral-200 text-xs font-black uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all">
                    Editorial Management
                  </Link>
                </div>
              </div>

              <div className="p-8 border-t border-neutral-100 bg-neutral-50 flex flex-col gap-4">
                 <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-loose">
                    {today}
                 </p>
                 <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-tighter">
                   Authenticated Journal of Record // v2.0
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
