import { useState, useMemo, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import { CATEGORIES } from '../data';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../hooks/useNews';
import { useNewsContext } from '../contexts/NewsContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { formatTimeAgo } from '../lib/dateUtils';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const { latestNews, trendingNews, loading: isContextLoading, error: contextError } = useNewsContext();
  
  // Use custom hook for category filtering, but fallback to context for "All"
  const { news: categoryNews, loading: isCategoryLoading, error: categoryError } = useNews(
    40, 
    selectedCategory === 'All' ? undefined : selectedCategory, 
    sortBy
  );

  const error = categoryError || contextError;

  const displayNews = useMemo(() => {
    if (selectedCategory === 'All') {
      return sortBy === 'latest' ? latestNews : trendingNews;
    }
    return categoryNews;
  }, [selectedCategory, sortBy, latestNews, trendingNews, categoryNews]);

  const isLoading = selectedCategory === 'All' ? isContextLoading : isCategoryLoading;

  const filteredNews = useMemo(() => {
    if (!searchQuery) return displayNews;
    const query = searchQuery.toLowerCase();
    return displayNews.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.summary.toLowerCase().includes(query)
    );
  }, [displayNews, searchQuery]);

  const heroArticle = filteredNews[0];
  const gridArticles = filteredNews.slice(1, 7);
  const secondaryArticles = filteredNews.slice(7);

  return (
    <div className="news-container pt-8">
      {/* Navigation & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12 border-y border-black py-4 md:py-6">
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar touch-pan-x">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all pb-1 ${selectedCategory === 'All' ? 'text-news-red border-b-2 border-news-red' : 'text-neutral-400 hover:text-black'}`}
          >
            Front Page
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all pb-1 ${selectedCategory === cat ? 'text-news-red border-b-2 border-news-red' : 'text-neutral-400 hover:text-black'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search Archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-50 border-b border-neutral-200 pl-9 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-black w-full min-w-[200px] sm:w-64 transition-all"
            />
          </div>
          <div className="flex bg-neutral-100 p-1 rounded-sm w-full sm:w-auto">
             <button 
               onClick={() => setSortBy('latest')}
               className={`flex-1 sm:flex-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'latest' ? 'bg-white text-black shadow-sm' : 'text-neutral-400'}`}
             >
               Latest
             </button>
             <button 
               onClick={() => setSortBy('trending')}
               className={`flex-1 sm:flex-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'trending' ? 'bg-white text-black shadow-sm' : 'text-neutral-400'}`}
             >
               Trending
             </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-neutral-100 border-t-black rounded-full animate-spin" />
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-40 text-center">
           <h3 className="text-2xl font-serif font-black mb-4">No Dispatches Found</h3>
           <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Adjust your filters or query to refine search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <main className="lg:col-span-8 flex flex-col gap-16">
            {heroArticle && (
              <ArticleCard article={heroArticle} variant="hero" />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {gridArticles.map((article, idx) => (
                <div key={article.id} className={idx % 2 === 0 ? 'md:pr-12 md:border-r border-neutral-100' : ''}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-12">
            <section className="bg-neutral-50 p-6 border border-neutral-100">
               <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">The Wire</h3>
                  <SlidersHorizontal size={14} className="text-neutral-300" />
               </div>
               <div className="flex flex-col gap-8">
                  {secondaryArticles.slice(0, 10).map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/article/${item.id}`)}
                      className="group cursor-pointer flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-news-red">{item.category}</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase">{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                      <h4 className="text-base font-serif font-bold leading-tight group-hover:text-[#003366] transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 mt-2 leading-relaxed italic">{item.summary.substring(0, 80)}...</p>
                    </motion.div>
                  ))}
               </div>
            </section>
            
            <Sidebar showHeader={true} />
          </aside>
        </div>
      )}

      {/* Full Width Quote Hook */}
      <section className="bg-neutral-100 py-32 mt-20 text-center border-y border-neutral-200 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="news-container max-w-4xl px-4">
          <p className="text-4xl md:text-6xl font-serif font-bold italic leading-[1.2] mb-12 text-ink">
            "Journalism is the first rough draft of history."
          </p>
          <div className="flex items-center justify-center gap-6">
             <div className="w-12 h-[2px] bg-[#003366]" />
             <span className="text-sm font-black uppercase tracking-[0.5em] text-[#003366]">The Reports</span>
             <div className="w-12 h-[2px] bg-[#003366]" />
          </div>
        </div>
      </section>
    </div>
  );
}
