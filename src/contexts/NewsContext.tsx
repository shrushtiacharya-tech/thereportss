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
const CACHE_EXPIRY = 60 * 60 * 1000; // 60 minutes
const QUOTA_BACKOFF_KEY = 'thereports_quota_backoff';
const QUOTA_BACKOFF_DURATION = 60 * 60 * 1000; // 1 hour

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    // Check backoff first
    const lastQuotaError = localStorage.getItem(QUOTA_BACKOFF_KEY);
    const hasBackoff = lastQuotaError && (Date.now() - parseInt(lastQuotaError) < QUOTA_BACKOFF_DURATION);

    // Check cache first (prefer fresh cache)
    const cached = localStorage.getItem(CACHE_KEY);
    let cachedData: any = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
        // If we have backoff OR cache is fresh, use cache and don't fetch
        if (hasBackoff || (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
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

    if (hasBackoff) {
      setLoading(false);
      return;
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
      // If we have ANY cached data, even stale, use it as fallback
      if (cachedData) {
        setLatestNews(cachedData.data.latest);
        setTrendingNews(cachedData.data.trending);
      } else {
        setLatestNews([]);
        setTrendingNews([]);
      }
      
      // Log firestore error if it's a quota issue and set backoff
      if (err.message?.includes("Quota")) {
        localStorage.setItem(QUOTA_BACKOFF_KEY, Date.now().toString());
        // We catch it here to prevent throwing and causing the error log in the UI
        console.warn("Firestore Quota hit. Backing off.");
      } else {
        setError("Synchronization issue. Please try again later.");
      }
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
