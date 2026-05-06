export type Category = 'National' | 'International' | 'Business' | 'Technology' | 'Entertainment' | 'Sports' | 'Opinion';

export interface NewsItem {
  id?: string;
  title: string;
  summary: string;
  body?: string;
  author: string;
  originalUrl: string;
  source: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  hash: string;
  status: 'published' | 'draft';
  views: number;
  imageUrl?: string;
}

export interface Article {
  id: string;
  category: Category;
  title: string;
  summary: string;
  body?: string;
  author: string;
  publishedAt: string;
  isHero?: boolean;
  isTrending?: boolean;
  imageUrl?: string;
}
