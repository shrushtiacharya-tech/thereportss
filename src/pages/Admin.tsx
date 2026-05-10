import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  getDocs, 
  setDoc, 
  getDoc,
  onSnapshot,
  where
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { NewsItem } from '../types';
import { formatTimeAgo } from '../lib/dateUtils';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { 
  Image,
  Upload,
  X,
  Trash2, 
  Edit, 
  Plus, 
  Save, 
  Loader2,
  Eye, 
  CheckCircle2, 
  FileText, 
  BarChart3,
  LogIn,
  LogOut,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const ADMIN_EMAIL = 'shrushtiacharya@gmail.com';

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    body: '',
    imageUrl: '',
    category: 'General',
    status: 'published' as 'published' | 'draft'
  });

  // Analytics State
  const [stats, setStats] = useState({
    totalViews: 0,
    publishedCount: 0,
    draftCount: 0,
    topCategory: 'N/A'
  });

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u && u.email === ADMIN_EMAIL) {
        // Clear previous if any (though auth should only fire once for login/logout usually)
        if (cleanup) cleanup();
        cleanup = setupListeners();
      } else {
        setLoading(false);
        if (cleanup) {
          cleanup();
          cleanup = null;
        }
      }
    });

    return () => {
      unsubAuth();
      if (cleanup) cleanup();
    };
  }, []);

  const setupListeners = () => {
    setLoading(true);
    
    // Listen for news updates
    const q = query(
      collection(db, 'news'), 
      where('originalUrl', '==', 'manual-entry'),
      orderBy('publishedAt', 'desc')
    );
    const unsubNews = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      setNews(items);
      
      // Calculate Analytics
      const totalViews = items.reduce((acc, item) => acc + (item.views || 0), 0);
      const published = items.filter(i => i.status === 'published').length;
      const drafts = items.filter(i => i.status === 'draft').length;
      
      const categoryCounts = items.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      const topCat = Object.entries(categoryCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

      setStats({
        totalViews,
        publishedCount: published,
        draftCount: drafts,
        topCategory: topCat
      });
      
      setLoading(false);
      setQuotaExceeded(false);
    }, (err: any) => {
      console.error("Firestore Listen Error:", err);
      if (err.message?.includes("Quota") || err.code === 'resource-exhausted') {
        setQuotaExceeded(true);
      }
      setLoading(false);
    });

    return () => {
      unsubNews();
    };
  };

  const login = async () => {
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== ADMIN_EMAIL) {
        setLoginError(`Access denied. ${result.user.email} is not authorized.`);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-blocked') {
        setLoginError("Login popup was blocked. Please enable popups for this site.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setLoginError("This domain is not authorized for authentication. Please add it to the 'Authorized domains' in your Firebase Authentication settings.");
      } else if (err.code === 'auth/internal-error' && err.message?.includes('cross-origin')) {
        setLoginError("Cross-origin authentication blocked. Try opening the app in a new tab.");
      } else {
        setLoginError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const logout = () => {
    signOut(auth);
    setLoginError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const existingItem = editingId ? news.find(n => n.id === editingId) : null;
      
      const itemData: any = {
        title: formData.title,
        summary: formData.summary,
        body: formData.body,
        imageUrl: formData.imageUrl,
        category: formData.category,
        status: formData.status,
        source: existingItem?.source || 'The Reports team',
        author: existingItem?.author || 'The Reports team',
        publishedAt: existingItem?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalUrl: existingItem?.originalUrl || 'manual-entry',
        views: existingItem?.views || 0,
        hash: existingItem?.hash || Math.random().toString(36).substring(2, 15),
      };

      if (editingId) {
        const docRef = doc(db, 'news', editingId);
        await updateDoc(docRef, itemData);
      } else {
        await addDoc(collection(db, 'news'), itemData);
      }

      setFormData({ title: '', summary: '', body: '', imageUrl: '', category: 'General', status: 'published' });
      setEditingId(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id || null);
    setFormData({
      title: item.title,
      summary: item.summary,
      body: item.body || '',
      imageUrl: item.imageUrl || '',
      category: item.category,
      status: item.status || 'published'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishToggle = async (item: NewsItem) => {
    if (!item.id) return;
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'news', item.id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `news/${item.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions reduced for safety
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 700;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Quality reduced to 0.6 to ensure it stays well under 1MB even with body text
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSubmitting(true);
      try {
        const resizedImage = await resizeImage(file);
        
        // Final sanity check on base64 size
        // 1MB = 1,048,576 bytes. 
        // We want to leave room for the article content (~200KB)
        // So we limit image to ~700,000 chars in base64 (~525KB binary)
        if (resizedImage.length > 700000) { 
          alert("Image is still too large after compression. Please use a smaller visual or one with less detail.");
          return;
        }
        
        setFormData(prev => ({ ...prev, imageUrl: resizedImage }));
      } catch (err) {
        console.error("Compression error:", err);
        alert("Failed to process image for dispatch.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', summary: '', body: '', imageUrl: '', category: 'General', status: 'published' });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-neutral-200 mb-4" size={60} />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Verifying Identity...</p>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
          <Link to="/">
            <img src="/logo.svg" alt="THE REPORTS" className="h-16 w-auto mb-2" />
          </Link>
          <div className="p-6 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-full">
            <ShieldCheck size={64} className={user ? "text-red-300" : "text-neutral-300"} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-serif font-black uppercase mb-3 tracking-tighter">
              {user ? "Unauthorized" : "Secure Terminal"}
            </h1>
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest leading-loose">
              {user 
                ? `Identity established as ${user.email}, but access to "The Reports" editorial systems is restricted.`
                : "Restricted access area. Please identify yourself to access \"The Reports\" editorial systems."
              }
            </p>
            {loginError && (
              <p className="mt-4 p-3 bg-red-50 text-red-600 text-[10px] font-mono uppercase border border-red-100">
                {loginError}
              </p>
            )}
          </div>
          {!user ? (
            <button 
              onClick={login}
              className="flex items-center gap-3 bg-[#003366] text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl hover:shadow-2xl"
            >
              <LogIn size={18} />
              Identify with Google
            </button>
          ) : (
            <button 
              onClick={logout}
              className="flex items-center gap-3 border-2 border-black px-10 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-neutral-100 transition-all shadow-xl"
            >
              <LogOut size={18} />
              Switch Account
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="news-container py-10">
      <Helmet>
        <title>Editorial Portal | The Reports</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Header with Exit */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 border-b-2 border-black pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-mono text-neutral-400 uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">Active Session: {user.email}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tighter">Editorial Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={logout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-2 border-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Quota Warning (Removed internal pointers to paid tiers per user request) */}
      {quotaExceeded && (
        <div className="mb-12 p-8 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(31,31,31,1)]">
          <div className="flex items-start gap-6">
            <ShieldCheck size={48} className="shrink-0" />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-black uppercase tracking-tighter">System Notice: Archive Mode Active</h2>
              <p className="text-xs font-mono uppercase tracking-[0.1em] leading-relaxed opacity-90">
                The editorial database is currently operating in high-demand mode (Archive Access). 
                Viewing previous dispatches may be limited. Direct article saves remain functional.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Restoration: Daily Cycle</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        {[
          { label: 'Readship', value: stats.totalViews.toLocaleString(), icon: <Eye size={18} />, color: 'text-news-blue' },
          { label: 'Published', value: stats.publishedCount, icon: <CheckCircle2 size={18} />, color: 'text-green-600' },
          { label: 'Drafts', value: stats.draftCount, icon: <FileText size={18} />, color: 'text-news-red' },
          { label: 'Coverage', value: stats.topCategory, icon: <TrendingUp size={18} />, color: 'text-ink' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border-2 border-neutral-100 p-4 md:p-6 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400">{stat.label}</span>
               <div className={stat.color}>{stat.icon}</div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Core Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Status Definitions & Guidelines */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="p-8 bg-[#003366]/5 border-2 border-[#003366]/10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-[#003366]">Status Definitions</h3>
              <ul className="flex flex-col gap-3">
                <li className="flex gap-3 text-[10px] leading-relaxed">
                  <span className="text-news-red font-black">DRAFT:</span> Article resides in the terminal. No public visibility.
                </li>
                <li className="flex gap-3 text-[10px] leading-relaxed">
                  <span className="text-news-blue font-black">PUBLISHED:</span> Live on global feed. Tracking analytics.
                </li>
              </ul>
           </div>
           
           <div className="p-8 bg-neutral-50 border-2 border-neutral-100">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-black">Editorial Integrity</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-loose">
                All dispatches must be cross-verified before committing to the public record. 
                Manual posting ensures the highest standard of journalistic analytical rigor.
              </p>
           </div>
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 border-2 border-black relative">
            <div className="absolute -top-3 left-6 bg-news-red text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
              {editingId ? "Amending Report" : "Drafting New Report"}
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <label className="label-caps mb-2 block">Headline of Professional Record</label>
                  <input 
                    required
                    className="w-full bg-neutral-50 border-b-2 border-neutral-200 px-4 py-3 text-lg font-serif focus:outline-none focus:border-news-red transition-all"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter analytical title..."
                  />
                </div>
                
                <div>
                  <label className="label-caps mb-2 block">Vertical</label>
                  <select 
                    className="w-full bg-neutral-50 border-b-2 border-neutral-200 px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-news-red appearance-none"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {['General', 'Politics', 'Economy', 'Technology', 'World', 'Sports', 'Culture', 'Opinion'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-caps mb-4 block">Archive Dispatch Media (Visuals)</label>
                <div className="flex flex-col gap-4">
                  {formData.imageUrl ? (
                    <div className="relative w-full aspect-video bg-neutral-100 border-2 border-dashed border-neutral-200 overflow-hidden group">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-news-red transition-colors shadow-xl"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full aspect-[21/9] bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-100 hover:border-news-blue transition-all group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                      <div className="p-4 rounded-full bg-white shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-neutral-400 group-hover:text-news-blue" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Transmit Visual Signal (Max 2MB)</span>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="label-caps mb-2 block">Report Teaser (Summary)</label>
                <textarea 
                  required
                  className="w-full bg-neutral-50 border-2 border-neutral-100 p-4 text-base font-serif leading-relaxed focus:outline-none focus:border-[#003366] min-h-[100px] transition-all"
                  value={formData.summary}
                  onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="One or two sentence teaser..."
                />
              </div>

              <div>
                <label className="label-caps mb-2 block">Analytical Context & Dispatch Body</label>
                <textarea 
                  required
                  className="w-full bg-neutral-50 border-2 border-neutral-100 p-6 text-base font-serif leading-relaxed focus:outline-none focus:border-[#003366] min-h-[350px] transition-all"
                  value={formData.body}
                  onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Drafting the detailed editorial summary (400-600 words)..."
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t font-mono border-neutral-100">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="status" 
                      checked={formData.status === 'published'}
                      onChange={() => setFormData(prev => ({...prev, status: 'published'}))}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.status === 'published' ? 'border-[#003366]' : 'border-neutral-300'}`}>
                      {formData.status === 'published' && <div className="w-1.5 h-1.5 rounded-full bg-[#003366]" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'published' ? 'text-[#003366]' : 'text-neutral-400'}`}>Immediately Live</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="status" 
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData(prev => ({...prev, status: 'draft'}))}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.status === 'draft' ? 'border-news-red' : 'border-neutral-300'}`}>
                      {formData.status === 'draft' && <div className="w-1.5 h-1.5 rounded-full bg-news-red" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.status === 'draft' ? 'text-news-red' : 'text-neutral-400'}`}>Retain as Draft</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  {editingId && (
                    <button 
                      type="button"
                      onClick={cancelEdit}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black"
                    >
                      Discard Changes
                    </button>
                  )}
                  <button 
                    disabled={isSubmitting}
                    className="bg-black text-white px-12 py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-news-red transition-all shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Commit Dispatch"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Registry */}
      <div className="border-t-4 border-black pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h3 className="text-3xl font-serif font-black uppercase tracking-tight">The Registry of Record</h3>
            <p className="text-[10px] font-mono text-neutral-400 uppercase">Synchronized with Distributed Cloud Ledger</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group flex-grow md:w-64">
              <input 
                type="text" 
                placeholder="Search Dispatch Archives..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-50 border-b-2 border-neutral-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-news-red transition-all"
              />
            </div>
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-neutral-50 border-b-2 border-neutral-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-news-red appearance-none cursor-pointer"
            >
              {['All', 'General', 'Politics', 'Economy', 'Technology', 'World', 'Sports', 'Culture', 'Opinion'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-neutral-200" size={60} />
            <p className="text-xs font-mono uppercase tracking-[0.5em] text-neutral-400">Reconciling Archives</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNews.map(item => (
              <div key={item.id} className="group bg-white border-2 border-neutral-50 hover:border-black transition-all p-4 md:p-6 flex flex-col gap-6 overflow-hidden">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className={`px-2 py-0.5 text-[7px] md:text-[8px] font-black uppercase tracking-widest ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-news-red/10 text-news-red'}`}>
                      {item.status || 'draft'}
                    </div>
                    <span className="text-[8px] md:text-[9px] font-mono text-neutral-300 font-bold tracking-tighter truncate max-w-[80px] sm:max-w-[150px]">{item.id}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-news-blue tracking-widest">{item.category}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-serif font-black leading-tight group-hover:text-news-red transition-colors">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    <span className="whitespace-nowrap">By: The Reports Editorial Board</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-200 hidden sm:inline" />
                    <span className="whitespace-nowrap">{new Date(item.publishedAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                    <span className="flex items-center gap-1 whitespace-nowrap"><Eye size={10} className="text-news-blue" /> {item.views || 0} READS</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border-t border-neutral-50 pt-4 mt-auto">
                  <Link 
                    to={`/article/${item.id}`}
                    target="_blank"
                    className="p-3 text-neutral-400 hover:text-news-blue transition-colors bg-neutral-50 rounded-full"
                    title="View Dispatch"
                  >
                    <Eye size={18} />
                  </Link>
                  <button 
                    onClick={() => handlePublishToggle(item)}
                    className={`p-3 transition-colors bg-neutral-50 rounded-full ${item.status === 'published' ? 'text-green-600 hover:text-news-red' : 'text-neutral-400 hover:text-green-600'}`}
                    title={item.status === 'published' ? 'Withdraw (Draft)' : 'Commit (Publish)'}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button 
                    onClick={() => startEdit(item)}
                    className="p-3 text-neutral-400 hover:text-black transition-colors bg-neutral-50 rounded-full"
                    title="Modify Report"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id!)}
                    className="p-3 text-neutral-400 hover:text-news-red transition-colors bg-neutral-50 rounded-full"
                    title="Exterminate"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filteredNews.length === 0 && (
              <div className="py-32 text-center border-2 border-dashed border-neutral-100 flex flex-col items-center gap-4 bg-neutral-50/30">
                 <FileText size={40} className="text-neutral-200" />
                 <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-neutral-400">
                    No dispatches matching current transmission filter
                 </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
