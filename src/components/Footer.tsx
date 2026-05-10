import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const newsSections = [
    { name: 'National', path: '/category/national' },
    { name: 'International', path: '/category/international' },
    { name: 'Business', path: '/category/business' },
    { name: 'Technology', path: '/category/technology' },
    { name: 'Opinion', path: '/category/opinion' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '#' },
    { name: 'Contact', path: '#' },
    { name: 'Archive', path: '#' },
    { name: 'Editorial Dashboard', path: '/admin' },
  ];

  const legalLinks = [
    { name: 'Terms of Use', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Cookie Policy', path: '#' },
  ];

  return (
    <footer className="bg-paper border-t border-ink/10 pt-16 pb-8">
      <div className="news-container">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          <div className="lg:w-1/3">
            <Link to="/">
              <img src="/logo.svg" alt="THE REPORTS" className="h-12 w-auto mb-6" />
            </Link>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Independent journalism following the highest standards of accuracy and objectivity since 2026. 
              Delivered daily from our bureaus in Mumbai and New Delhi to a global audience.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all cursor-pointer text-neutral-400">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all cursor-pointer text-neutral-400">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all cursor-pointer text-neutral-400">
                <Linkedin size={16} />
              </a>
              <a href="mailto:contact@thereports.in" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all cursor-pointer text-neutral-400">
                <Mail size={16} />
              </a>
            </div>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-ink mb-6">Sections</h4>
              <ul className="flex flex-col gap-3">
                {newsSections.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs font-bold uppercase tracking-wider hover:text-news-blue transition-colors text-neutral-500">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-ink mb-6">Registry</h4>
              <ul className="flex flex-col gap-3">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs font-bold uppercase tracking-wider hover:text-news-blue transition-colors text-neutral-500">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-ink mb-6">Compliance</h4>
              <ul className="flex flex-col gap-3">
                {legalLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs font-bold uppercase tracking-wider hover:text-news-blue transition-colors text-neutral-500">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase font-black tracking-[0.2em] text-neutral-400">
          <span>&copy; {new Date().getFullYear()} The Reports Group. Authenticated Journalism.</span>
          <div className="flex gap-8 items-center">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Node Global-1 Active
            </span>
            <span className="opacity-60">Archive ID: TR-2026-X1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
