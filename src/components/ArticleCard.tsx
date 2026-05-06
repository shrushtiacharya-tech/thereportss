import { Article } from '../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'grid' | 'sidebar' | 'list';
}

export default function ArticleCard({ article, variant = 'grid' }: ArticleCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.id}`);
    window.scrollTo(0, 0);
  };

  if (variant === 'hero') {
    return (
      <article 
        onClick={handleClick}
        className="group cursor-pointer active:scale-[0.98] transition-transform duration-200 border-b-2 border-black pb-8 md:pb-12"
      >
        <div className="flex flex-col gap-4 md:gap-8 py-4 md:py-8">
          {article.imageUrl && (
            <div className="w-full aspect-[21/9] overflow-hidden bg-neutral-100 border border-neutral-200">
               <img 
                 src={article.imageUrl} 
                 alt={article.title} 
                 className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" 
               />
            </div>
          )}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-news-blue border-l-2 border-news-blue pl-2 mb-1">
              {article.category}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-black leading-[1.1] group-hover:text-[#003366] transition-colors tracking-tight">
              {article.title}
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-neutral-700 font-sans leading-relaxed italic md:leading-loose">
              {article.summary}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-2">
              <span className="text-ink">By {article.author}</span>
              <span className="hidden sm:inline w-1 h-[10px] bg-neutral-300" />
              <span>{article.publishedAt}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'sidebar') {
    return (
      <article 
        onClick={handleClick}
        className="group cursor-pointer py-4 border-b border-border-news last:border-0 active:translate-x-1 transition-transform"
      >
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-1">
            <div className="label-caps text-[7px] hover:text-news-blue transition-colors">{article.category}</div>
            <h3 className="text-[11px] font-bold font-serif group-hover:text-news-red transition-colors leading-snug">
              {article.title}
            </h3>
            <div className="text-[8px] uppercase tracking-wider font-bold text-neutral-400">
              {article.publishedAt}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      onClick={handleClick}
      className="group cursor-pointer py-6 md:py-8 flex flex-col gap-4 border-b border-neutral-100 last:border-0 h-full hover:bg-neutral-50/50 transition-colors px-1 sm:px-2 active:bg-neutral-100"
    >
      {article.imageUrl && (
        <div className="w-full aspect-video overflow-hidden bg-neutral-100 border border-neutral-100 mb-2">
           <img 
             src={article.imageUrl} 
             alt={article.title} 
             className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" 
           />
        </div>
      )}
      <div className="flex flex-col gap-2 md:gap-3 flex-grow">
        <label className="text-[8px] md:text-[9px] uppercase font-black tracking-widest text-[#003366] border-l-2 border-[#003366] pl-2 leading-none">
          {article.category}
        </label>
        <h3 className="text-lg md:text-xl font-serif font-black leading-tight group-hover:text-[#003366] transition-colors">
          {article.title}
        </h3>
        <p className="text-[11px] md:text-[12px] text-neutral-600 line-clamp-3 leading-relaxed font-sans">
          {article.summary}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3 items-center text-[8px] font-black uppercase tracking-widest text-neutral-400 mt-auto pt-4 border-t border-neutral-50">
        <span className="text-neutral-700 whitespace-nowrap">By {article.author}</span>
        <span className="w-px h-[8px] bg-neutral-300 hidden sm:inline" />
        <span className="whitespace-nowrap">{article.publishedAt}</span>
      </div>
    </article>
  );
}
