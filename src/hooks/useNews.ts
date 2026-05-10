import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const newsCache: Record<string, { data: NewsItem[], timestamp: number }> = {};
const CATEGORY_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for better quota management

export function useNews(count: number = 10, category?: string, sortBy: 'latest' | 'trending' = 'latest') {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      const cacheKey = `${category || 'All'}_${sortBy}_${count}`;
      
      // Check memory cache
      if (newsCache[cacheKey] && (Date.now() - newsCache[cacheKey].timestamp < CATEGORY_CACHE_EXPIRY)) {
        setNews(newsCache[cacheKey].data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const sortField = sortBy === 'latest' ? 'publishedAt' : 'views';
      
      try {
        let q;
        if (category && category !== 'All') {
          q = query(
            collection(db, 'news'),
            where('status', '==', 'published'),
            where('originalUrl', '==', 'manual-entry'),
            where('category', '==', category),
            orderBy(sortField, 'desc'),
            limit(count)
          );
        } else {
          q = query(
            collection(db, 'news'),
            where('status', '==', 'published'),
            where('originalUrl', '==', 'manual-entry'),
            orderBy(sortField, 'desc'),
            limit(count)
          );
        }

        const snapshot = await getDocs(q);
        if (isMounted) {
          const items = snapshot.docs.map(doc => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              ...data
            };
          }) as NewsItem[];
          
          // Update memory cache
          newsCache[cacheKey] = { data: items, timestamp: Date.now() };
          
          setNews(items);
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          const isQuotaError = err.message?.includes("Quota") || err.code === 'resource-exhausted';
          
          // Fallback to memory cache if hit quota or network error
          if (newsCache[cacheKey]) {
            setNews(newsCache[cacheKey].data);
            setError(isQuotaError ? "Daily limit reached. Using memory cache." : "Network error. Using cache.");
          } else {
            setError(isQuotaError ? "Daily dispatch limit reached." : "Failed to fetch news.");
          }
          setLoading(false);
        }
      }
    };

    fetchNews();
    return () => { isMounted = false; };
  }, [count, category, sortBy]);

  return { news, loading, error };
}
