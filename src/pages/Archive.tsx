import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Archive() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArchive() {
      try {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NewsItem));
        setArticles(items);
      } catch (err) {
        console.error("Archive fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArchive();
  }, []);

  return (
    <div className="news-container py-12 md:py-20">
      <Helmet>
        <title>Dispatches Archive | The Reports</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <header className="border-b-4 border-black pb-8 mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
            Registry Archive
          </h1>
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500">
            CHRONOLOGICAL RECORD OF ALL PUBLISHED DISPATCHES
          </p>
        </header>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {articles.map((article, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={article.id}
              >
                <Link 
                  to={`/article/${article.id}`}
                  className="group flex items-center justify-between py-6 hover:bg-neutral-50 transition-colors px-4 -mx-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase text-neutral-400">
                      <Calendar size={12} />
                      {article.createdAt instanceof Date 
                        ? article.createdAt.toLocaleDateString() 
                        : (article.createdAt as any)?.toDate?.().toLocaleDateString() || 'Recent'}
                      <span className="text-[#003366]">{article.category}</span>
                    </div>
                    <h2 className="text-xl font-bold group-hover:text-[#003366] transition-colors line-clamp-1 italic">
                      {article.title}
                    </h2>
                  </div>
                  <ChevronRight size={20} className="text-neutral-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
