import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface NewsContextType {
  latestNews: NewsItem[];
  trendingNews: NewsItem[];
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const CACHE_KEY = 'thereports_news_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 60 minutes for better quota management

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    // Check cache first (prefer fresh cache)
    const cached = localStorage.getItem(CACHE_KEY);
    let cachedData: any = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
        // If data is very fresh, don't even try the network to save quota
        if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
          setLatestNews(cachedData.data.latest);
          setTrendingNews(cachedData.data.trending);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    try {
      const latestQuery = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        where('originalUrl', '==', 'manual-entry'),
        orderBy('publishedAt', 'desc'),
        limit(15)
      );

      const trendingQuery = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        where('originalUrl', '==', 'manual-entry'),
        orderBy('views', 'desc'),
        limit(10)
      );

      const [latestSnap, trendingSnap] = await Promise.all([
        getDocs(latestQuery),
        getDocs(trendingQuery)
      ]);

      const latest = latestSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as NewsItem[];
      const trending = trendingSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as NewsItem[];

      if (latest.length > 0) {
        setLatestNews(latest);
        setTrendingNews(trending);
        setError(null);
        
        // Store in cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { latest, trending },
          timestamp: Date.now()
        }));
      } else {
        setLatestNews([]);
        setTrendingNews([]);
        setError(null);
      }
    } catch (err: any) {
      console.error("News fetch error:", err);
      
      const isQuotaError = err.message?.includes("Quota") || err.code === 'resource-exhausted';
      
      // If we have ANY cached data, even stale, use it as fallback
      if (cachedData) {
        setLatestNews(cachedData.data.latest);
        setTrendingNews(cachedData.data.trending);
        setError(isQuotaError 
          ? "Daily dispatch limit reached. Browsing archives (Cache Mode)." 
          : "Operating from archive cache (Network offline)");
      } else {
        setLatestNews([]);
        setTrendingNews([]);
        setError(isQuotaError
          ? "Daily dispatch limit reached. Archives will reset at midnight."
          : "Sync unavailable. Please try again later.");
      }
      
      // Don't throw the error, just handle it in UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <NewsContext.Provider value={{ latestNews, trendingNews, loading, error, refreshNews: fetchNews }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNewsContext must be used within a NewsProvider');
  }
  return context;
};
