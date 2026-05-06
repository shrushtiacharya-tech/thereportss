import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ARTICLES } from '../data';
import Sidebar from '../components/Sidebar';
import { Share2, Bookmark, MessageSquare, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';
import { formatFullDate } from '../lib/dateUtils';
import { useNews } from '../hooks/useNews';

export default function Article() {
  const { articleId } = useParams<{ articleId: string }>();
  const [dynamicArticle, setDynamicArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Try to find in static ARTICLES first
  const staticArticle = ARTICLES.find(a => a.id === articleId);

  useEffect(() => {
    if (staticArticle || !articleId) return;
    
    const fetchDynamic = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "news", articleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as NewsItem;
          setDynamicArticle({
            ...data,
            author: data.author || 'The Reports Team',
            body: data.body || data.summary, // Use body if available, fallback to summary
          });
          
          // Increment views asynchronously
          updateDoc(docRef, {
            views: increment(1)
          }).catch(err => console.error("Error incrementing views:", err));
        }
      } catch (err) {
        console.error("Error fetching dynamic article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamic();
  }, [articleId, staticArticle]);

  const article = staticArticle || dynamicArticle;

  if (loading) {
    return (
      <div className="news-container py-20 text-center">
        <div className="w-12 h-12 border-4 border-neutral-100 border-t-black rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-serif text-neutral-400 uppercase tracking-widest">Retrieving Dispatch...</h2>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="news-container py-20 text-center">
        <h2 className="text-3xl font-serif font-black mb-4">Dispatch Not Found</h2>
        <Link to="/" className="text-[#003366] font-bold uppercase tracking-widest hover:underline">
          Return to Front Page
        </Link>
      </div>
    );
  }

  return (
    <div className="news-container pt-8">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-neutral-400 hover:text-ink transition-colors mb-8 group">
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to News
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <article className="lg:col-span-8 lg:border-r lg:border-neutral-100 lg:pr-12">
          {/* Article Header: Full Width */}
          <header className="flex flex-col gap-6 mb-12">
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-news-red mb-2">
              {article.category} // dispatch report
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black leading-[1.1] text-ink mb-2 tracking-tight">
              {article.title}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 font-sans leading-relaxed border-y border-neutral-100 py-6 md:py-8 my-4 italic font-medium">
              {article.summary}
            </p>

            {article.imageUrl && (
              <figure className="my-10">
                <div className="w-full aspect-video overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover grayscale transition-all duration-1000 hover:grayscale-0" 
                  />
                </div>
                <figcaption className="mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-l border-neutral-200 pl-4 py-1">
                  Dispatch Attachment // Reference Archive Entry TR-SIGNAL
                </figcaption>
              </figure>
            )}
          </header>

          {/* Internal Grid for Body & Context Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Left/Main Column: Metadata and Body */}
            <div className="xl:col-span-9 flex flex-col gap-8 md:gap-10">
              {/* Desktop Horizontal Meta (Mobile Column) */}
              <div className="flex flex-wrap justify-between items-center gap-4 md:gap-6 pb-6 md:pb-8 border-b border-neutral-100 mb-2 md:mb-4">
                <div className="flex gap-3 md:gap-4 items-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-xs text-neutral-400">TR</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#003366]">
                      {article.author}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                      Bureau Correspondent
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1 md:gap-2 text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Verified Dispatch
                  </span>
                  <span>{formatFullDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Prose Body */}
              <div className="prose prose-neutral max-w-none flex flex-col gap-5 md:gap-6 text-base md:text-lg leading-relaxed text-neutral-800 font-serif text-left md:text-justify selection:bg-news-red/10">
                {article.body ? (
                  <div className="flex flex-col gap-5 md:gap-6">
                    {(article.body.includes('\n\n') ? article.body.split('\n\n') : article.body.split('\n'))
                      .map(p => p.trim())
                      .filter(p => p.length > 0)
                      .map((paragraph: string, idx: number) => (
                        <React.Fragment key={idx}>
                          <p className={idx === 0 ? "first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2 first-letter:text-[#003366]" : ""}>
                            {paragraph}
                          </p>
                        </React.Fragment>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 md:gap-6">
                    {(article.summary.includes('\n\n') ? article.summary.split('\n\n') : article.summary.split('\n'))
                      .map(p => p.trim())
                      .filter(p => p.length > 0)
                      .map((p, idx) => (
                        <p key={idx} className={idx === 0 ? "first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2 first-letter:text-[#003366]" : ""}>
                          {p}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right/Internal Column: Interaction & Highlights */}
            <aside className="xl:col-span-3 flex flex-col gap-8 sticky top-24">
              <div className="flex flex-row xl:flex-col items-center xl:items-start justify-between xl:justify-start gap-4 border-y xl:border-y-0 xl:border-b border-neutral-100 py-6 xl:pt-0 xl:pb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Engage</div>
                <div className="flex gap-4">
                  <button title="Share" className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-full text-neutral-600 transition-all border border-neutral-100 hover:border-neutral-200 cursor-pointer"><Share2 size={16} /></button>
                  <button title="Bookmark" className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-full text-neutral-600 transition-all border border-neutral-100 hover:border-neutral-200 cursor-pointer"><Bookmark size={16} /></button>
                  <button title="Discuss" className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-full text-neutral-600 transition-all border border-neutral-100 hover:border-neutral-200 cursor-pointer"><MessageSquare size={16} /></button>
                </div>
              </div>

              <div className="hidden xl:flex flex-col gap-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#003366] border-b border-neutral-100 pb-2">Editorial Context</div>
                <p className="text-[11px] text-neutral-500 italic leading-relaxed">
                  This dispatch has been analyzed by our automated editorial board. We maintain strict objectivity standards 
                  across all global technological and economic reports.
                </p>
                <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                   <div className="text-[9px] font-black uppercase text-news-red mb-2 tracking-widest">Global Reach</div>
                   <p className="text-[10px] text-neutral-600 leading-snug">Synced via high-frequency trade circuits and international news buffers.</p>
                </div>
              </div>
            </aside>
          </div>
          
          {/* Related Articles */}
          <RelatedArticles currentId={articleId!} category={article.category} />

          <div className="mt-20 pt-10 border-t-2 border-black flex flex-col items-center gap-6">
             <Link to="/" className="bg-[#003366] text-white px-10 py-3 text-xs font-black uppercase tracking-widest hover:bg-black transition-colors">
               Return to Front Page dispatched
             </Link>
             <div className="h-px bg-neutral-100 w-full max-w-sm mt-4" />
             <p className="text-neutral-400 font-sans text-[10px] uppercase tracking-widest">
                © {new Date().getFullYear()} The Reports Group. Authenticated Journalism.
             </p>
          </div>
        </article>
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

function RelatedArticles({ currentId, category }: { currentId: string, category: string }) {
  const { news } = useNews(4, category);
  const related = news.filter((n: any) => n.id !== currentId).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-20 border-t-4 border-black pt-12">
      <h3 className="text-2xl font-serif font-black uppercase tracking-tight mb-8">Related Coverage</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {related.map((item: any) => (
          <Link key={item.id} to={`/article/${item.id}`} className="flex flex-col gap-3 group">
            <div className="text-[9px] font-black uppercase tracking-widest text-news-red">{item.category}</div>
            <h4 className="text-lg font-serif font-black leading-tight group-hover:text-[#003366] transition-colors">{item.title}</h4>
            <div className="text-[9px] font-mono text-neutral-400 uppercase">{formatFullDate(item.publishedAt)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
