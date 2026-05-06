import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsItem } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export function useNews(count: number = 20, category?: string, sortBy: 'latest' | 'trending' = 'latest') {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sortField = sortBy === 'latest' ? 'publishedAt' : 'views';
    
    let q = query(
      collection(db, 'news'),
      where('status', '==', 'published'),
      orderBy(sortField, 'desc'),
      limit(count)
    );

    if (category && category !== 'All') {
      q = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        where('category', '==', category),
        orderBy(sortField, 'desc'),
        limit(count)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      setNews(items);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'news');
    });

    return () => unsubscribe();
  }, [count, category, sortBy]);

  return { news, loading, error };
}
