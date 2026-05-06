import { useParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import { useNews } from '../hooks/useNews';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { news: filteredArticles, loading } = useNews(20, categoryId?.charAt(0).toUpperCase() + categoryId!.slice(1));

  return (
    <div className="news-container pt-8">
      <div className="border-b-4 border-ink pb-4 mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          {categoryId}
        </h1>
        <p className="text-neutral-500 font-medium uppercase tracking-[0.2em] mt-2">
          Latest reporting from our {categoryId} desk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-neutral-100 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {filteredArticles.map((article) => (
                <div key={article.id}>
                  <ArticleCard article={article} variant="grid" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border-news rounded">
              <p className="text-neutral-400 font-serif italic text-lg">
                No articles found in this category yet.
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
