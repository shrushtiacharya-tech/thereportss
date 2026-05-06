import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const newsCache: Record<string, { data: NewsItem[], timestamp: number }> = {};
const CATEGORY_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const QUOTA_BACKOFF_KEY = 'thereports_quota_backoff';

export function useNews(count: number = 10, category?: string, sortBy: 'latest' | 'trending' = 'latest') {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      const cacheKey = `${category || 'All'}_${sortBy}_${count}`;
      
      // Check for global quota backoff
      const lastQuotaError = localStorage.getItem(QUOTA_BACKOFF_KEY);
      const isBackingOff = lastQuotaError && (Date.now() - parseInt(lastQuotaError) < 60 * 60 * 1000);

      // Check memory cache
      if (newsCache[cacheKey] && (Date.now() - newsCache[cacheKey].timestamp < CATEGORY_CACHE_EXPIRY || isBackingOff)) {
        setNews(newsCache[cacheKey].data);
        setLoading(false);
        return;
      }

      if (isBackingOff) {
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
        }
      } catch (err: any) {
        if (isMounted) {
          // If we have ANY cached data, even stale, use it as fallback
          if (newsCache[cacheKey]) {
            setNews(newsCache[cacheKey].data);
          } else {
            setError('Service temporarily unavailable.');
          }

          if (err.message?.includes("Quota")) {
            localStorage.setItem(QUOTA_BACKOFF_KEY, Date.now().toString());
            console.warn("Firestore Quota hit in hook. Backing off.");
          } else {
            handleFirestoreError(err, OperationType.LIST, 'news');
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
