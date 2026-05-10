import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Yahoo Finance Configuration
const yahooFinance = new YahooFinance({
  queue: {
    concurrency: 2
  }
});

const dbAdmin = admin.firestore();

const app = express();

export default app;

async function startServer() {
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Log all requests to help debug
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Market Data Route
  app.get('/api/markets', async (req, res) => {
    console.log('Fetching market data...');
    try {
      const symbols = ['^BSESN', '^NSEI', '^NSEBANK', 'INR=X'];
      
      // Fetch quotes using the initialized yahooFinance instance
      const results = await Promise.all(
        symbols.map(symbol => yahooFinance.quote(symbol).catch(err => {
          console.error(`Error fetching ${symbol}:`, err);
          return null;
        }))
      );

      const marketData = results
        .filter(quote => quote !== null)
        .map(quote => {
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

      if (marketData.length === 0) {
        throw new Error('No market data could be retrieved');
      }

      res.json(marketData);
    } catch (error) {
      console.error('Market data fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
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

// Start the server only if run directly (not via Vercel/imported)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}
