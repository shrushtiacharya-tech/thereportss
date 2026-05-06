import { useState, useEffect } from 'react';
import { useNewsContext } from '../contexts/NewsContext';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketItem {
  code: string;
  value: string;
  change: string;
  isUp: boolean;
}

interface SidebarProps {
  showHeader?: boolean;
}

const INITIAL_MARKET_DATA: MarketItem[] = [
  { code: 'SENSEX', value: '72,431.18', change: '+0.45%', isUp: true },
  { code: 'NIFTY 50', value: '22,126.65', change: '+0.38%', isUp: true },
  { code: 'USD/INR', value: '83.24', change: '-0.12%', isUp: false },
  { code: 'GOLD', value: '62,450.00', change: '+1.20%', isUp: true }
];

export default function Sidebar({ showHeader = true }: SidebarProps) {
  const { trendingNews: trending } = useNewsContext();
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKET_DATA);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        setMarkets(data);
      } catch (error) {
        console.error('Failed to fetch real market data:', error);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex flex-col gap-10 h-fit lg:sticky lg:top-24">
      {/* Markets */}
      {showHeader && (
        <section>
          <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-2 group cursor-pointer">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink">Market Outlook</h4>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-news-red rounded-full" />
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {markets.map((item) => (
              <div 
                key={item.code} 
                className="flex items-center justify-between border-b border-neutral-50 pb-2"
              >
                <span className="text-[10px] font-black underline decoration-neutral-200 uppercase tracking-widest text-neutral-500">{item.code}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold">{item.value}</span>
                  <span className={`text-[10px] font-black ${item.isUp ? 'text-emerald-600' : 'text-news-red'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section>
        {showHeader && (
          <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-2 group cursor-pointer">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-news-red">Top Reports</h4>
            <TrendingUp size={14} className="text-news-red" />
          </div>
        )}
        <div className="flex flex-col">
          {trending.map((article, idx) => (
            <div 
              key={article.id} 
              className="group flex gap-4 py-5 border-b border-neutral-100 last:border-0 cursor-pointer"
              onClick={() => {
                navigate(`/article/${article.id}`);
                window.scrollTo(0, 0);
              }}
            >
              <span className="text-4xl font-serif font-black text-neutral-200 group-hover:text-[#003366] transition-colors leading-none">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1">
                <div className="text-[8px] font-black uppercase text-[#003366] tracking-widest">{article.category}</div>
                <h3 className="text-sm font-serif font-bold group-hover:text-[#003366] transition-colors leading-tight">
                  {article.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-paper border border-[#003366]/20 p-6 flex flex-col gap-4">
        <div>
          <h4 className="text-lg font-serif font-black mb-1 text-[#003366]">The Morning Dispatch</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">The day's essential briefings, curated by our editors and delivered to your inbox every morning.</p>
        </div>
        <div className="flex flex-col gap-2">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="bg-white border border-neutral-200 px-3 py-2 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-[#003366] transition-colors"
          />
          <button className="bg-[#003366] hover:bg-black transition-colors text-white py-2 text-[10px] font-black uppercase tracking-widest">
            Subscribe
          </button>
        </div>
      </section>
    </aside>
  );
}
