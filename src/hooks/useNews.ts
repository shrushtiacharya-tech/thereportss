import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const newsCache: Record<string, { data: NewsItem[], timestamp: number }> = {};
const CATEGORY_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for better quota management
const PERSISTENT_CACHE_PREFIX = 'thereports_cat_cache_';

export function useNews(count: number = 10, category?: string, sortBy: 'latest' | 'trending' = 'latest', enabled: boolean = true) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    
    let isMounted = true;
    const fetchNews = async () => {
      const cacheKey = `${category || 'All'}_${sortBy}_${count}`;
      
      // 1. Check memory cache
      if (newsCache[cacheKey] && (Date.now() - newsCache[cacheKey].timestamp < CATEGORY_CACHE_EXPIRY)) {
        setNews(newsCache[cacheKey].data);
        setLoading(false);
        return;
      }

      // 2. Check localStorage cache
      const persistentKey = PERSISTENT_CACHE_PREFIX + cacheKey;
      const stored = localStorage.getItem(persistentKey);
      
      // Check if we already hit quota recently
      const quotaHit = sessionStorage.getItem('thereports_quota_hit');
      
      if (stored) {
        try {
          const { data, timestamp } = JSON.parse(stored);
          // If we hit quota or cache is still valid, use it
          if (quotaHit || (Date.now() - timestamp < CATEGORY_CACHE_EXPIRY)) {
            setNews(data);
            setLoading(false);
            if (quotaHit) setError("Archive Mode: Dispatch limit reached.");
            return;
          }
        } catch (e) {
          localStorage.removeItem(persistentKey);
        }
      } else if (quotaHit) {
        setError("Dispatch limit reached.");
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
          
          // Update persistent cache
          localStorage.setItem(persistentKey, JSON.stringify({
            data: items,
            timestamp: Date.now()
          }));
          
          setNews(items);
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          const isQuotaError = err.message?.includes("Quota") || err.message?.includes("quota") || err.code === 'resource-exhausted';
          
          if (isQuotaError) {
            sessionStorage.setItem('thereports_quota_hit', 'true');
          }

          // Fallback to memory cache or localStorage if hit quota or network error
          const stored = localStorage.getItem(persistentKey);
          if (newsCache[cacheKey]) {
            setNews(newsCache[cacheKey].data);
            setError(isQuotaError ? "Dispatch limit reached. Using memory cache." : "Network error. Using cache.");
          } else if (stored) {
            try {
              const { data } = JSON.parse(stored);
              setNews(data);
              setError(isQuotaError ? "Dispatch limit reached. Serving from archives." : "Network error. Serving from archives.");
            } catch (e) {
              setError(isQuotaError ? "Daily dispatch limit reached." : "Failed to fetch news.");
            }
          } else {
            setError(isQuotaError ? "Daily dispatch limit reached. Reset at midnight." : "Failed to fetch news.");
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
