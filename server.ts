import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const dbAdmin = admin.firestore();

const yahooFinance = new (YahooFinance as any)();
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
  htmlEntities: true
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Market Data Route
  app.get('/api/markets', async (req, res) => {
    try {
      const symbols = ['^BSESN', '^NSEI', '^NSEBANK', 'INR=X'];
      const results = await Promise.all(
        symbols.map(symbol => yahooFinance.quote(symbol))
      ) as any[];

      const marketData = results.map(quote => {
        let name = quote.symbol;
        if (quote.symbol === '^BSESN') name = 'SENSEX';
        if (quote.symbol === '^NSEI') name = 'NIFTY 50';
        if (quote.symbol === '^NSEBANK') name = 'NIFTY BANK';
        if (quote.symbol === 'INR=X') name = 'USD/INR';

        return {
          code: name,
          value: quote.regularMarketPrice?.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }) || 'N/A',
          change: `${quote.regularMarketChangePercent?.toFixed(2)}%`,
          isUp: (quote.regularMarketChangePercent || 0) >= 0
        };
      });

      res.json(marketData);
    } catch (error) {
      console.error('Market data fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // News Feed Route
  app.get('/api/news', async (req, res) => {
    try {
      const response = await fetch('https://news.google.com/rss/search?q=source:Reuters&hl=en-IN&gl=IN&ceid=IN:en');
      const text = await response.text();
      const jsonObj = xmlParser.parse(text);
      const items = jsonObj.rss?.channel?.item || [];
      const rawItems = Array.isArray(items) ? items : [items];
      
      const newsItems = rawItems.map((item: any) => {
        const content = item.description || item.content || '';
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        let imageUrl = imgMatch ? imgMatch[1] : undefined;

        return {
          id: item.guid?.['#text'] || item.guid || Math.random().toString(36).substr(2, 9),
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          summary: content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
          imageUrl: imageUrl, 
          source: 'Reuters'
        };
      }).slice(0, 10);

      res.json(newsItems);
    } catch (error) {
      console.error('News fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch news feed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
