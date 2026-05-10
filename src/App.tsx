import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import Admin from './pages/Admin';
import { NewsProvider } from './contexts/NewsContext';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <NewsProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="category/:categoryId" element={<Category />} />
              <Route path="article/:articleId" element={<Article />} />
              <Route path="admin" element={<Admin />} />
            </Route>
          </Routes>
        </NewsProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
