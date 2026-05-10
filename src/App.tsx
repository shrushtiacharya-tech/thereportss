import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import Admin from './pages/Admin';
import { NewsProvider } from './contexts/NewsContext';

import Archive from './pages/Archive';
import StaticPage from './pages/StaticPage';

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
              <Route path="archive" element={<Archive />} />
              
              {/* Static Pages */}
              <Route path="about" element={
                <StaticPage 
                  title="About Us" 
                  subtitle="The Editorial Mission of The Reports"
                  content={
                    <>
                      <p className="text-xl font-medium italic mb-8 border-l-4 border-[#003366] pl-6 py-2 bg-neutral-50">
                        "Accuracy is our foundation. Verification is our process. Truth is our goal."
                      </p>
                      <p>
                        Established in 2026, <strong>The Reports</strong> was founded on a simple premise: 
                        the modern world needs digital journalism that respects the reader's time and intelligence. 
                        We avoid sensationalism and click-bait, focusing instead on deep analytical coverage 
                        of the forces shaping our global society.
                      </p>
                      <p>
                        From our primary newsrooms in Mumbai and New Delhi, we coordinate a network of 
                        specialized contributors across the globe. Our coverage spans the intersection 
                        of high-stakes politics, emerging technology, and the global business landscape.
                      </p>
                      <h3 className="text-2xl font-black uppercase mt-12 mb-4">Independence Statement</h3>
                      <p>
                        The Reports is an independent entity. We do not accept funding from political organizations 
                        or corporate entities that would compromise our editorial neutrality. Our loyalty remains 
                        entirely with the facts and our readership.
                      </p>
                    </>
                  }
                />
              } />
              
              <Route path="terms" element={
                <StaticPage 
                  title="Terms of Use" 
                  subtitle="Legal Framework for Accessing Our Services"
                  content={
                    <>
                      <p>Welcome to The Reports. By accessing this website, you agree to comply with and be bound by the following terms and conditions of use.</p>
                      <h3 className="text-xl font-bold mt-8">1. Intellectual Property</h3>
                      <p>All content published on The Reports, including text, graphics, logos, and images, is the property of The Reports Group or its content suppliers and is protected by international copyright laws.</p>
                      <h3 className="text-xl font-bold mt-8">2. Use License</h3>
                      <p>Permission is granted to temporarily download one copy of the materials on The Reports' website for personal, non-commercial transitory viewing only.</p>
                      <h3 className="text-xl font-bold mt-8">3. Disclaimer</h3>
                      <p>The materials on The Reports' website are provided on an 'as is' basis. The Reports makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
                    </>
                  }
                />
              } />

              <Route path="privacy" element={
                <StaticPage 
                  title="Privacy Policy" 
                  subtitle="Commitment to Data Sovereignty and User Security"
                  content={
                    <>
                      <p>Your privacy is important to us. It is The Reports' policy to respect your privacy regarding any information we may collect from you across our website.</p>
                      <h3 className="text-xl font-bold mt-8">Information We Collect</h3>
                      <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
                      <h3 className="text-xl font-bold mt-8">Data Retention</h3>
                      <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft.</p>
                      <h3 className="text-xl font-bold mt-8">External Links</h3>
                      <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites.</p>
                    </>
                  }
                />
              } />

              <Route path="cookies" element={
                <StaticPage 
                  title="Cookie Policy" 
                  subtitle="Transparency in Digital Tracking and Preferences"
                  content={
                    <>
                      <p>This is the Cookie Policy for The Reports, accessible from thereports.in</p>
                      <h3 className="text-xl font-bold mt-8">What Are Cookies</h3>
                      <p>As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.</p>
                      <h3 className="text-xl font-bold mt-8">How We Use Cookies</h3>
                      <p>We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.</p>
                      <h3 className="text-xl font-bold mt-8">Disabling Cookies</h3>
                      <p>You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.</p>
                    </>
                  }
                />
              } />
            </Route>
          </Routes>
        </NewsProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
