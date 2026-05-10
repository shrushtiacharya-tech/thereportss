import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';

interface StaticPageProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export default function StaticPage({ title, subtitle, content }: StaticPageProps) {
  return (
    <div className="news-container py-12 md:py-20 lg:py-24">
      <Helmet>
        <title>{title} | The Reports</title>
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <header className="border-b-4 border-black pb-8 mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-500">
              {subtitle}
            </p>
          )}
        </header>

        <div className="prose prose-neutral max-w-none text-neutral-800 leading-relaxed space-y-6">
          {content}
        </div>
      </motion.div>
    </div>
  );
}
