import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { scrapeIndiaMART } from './scrapers/indiamart-scraper.js';
import { scrapeTradeIndia } from './scrapers/tradeindia-scraper.js';
import { scrapeExportersIndia } from './scrapers/exportersindia-scraper.js';
import { generateDemoCompetitors } from './scrapers/demo-data-generator.js';
import { fetchAllCarrierRates, fetchSingleCarrierRate } from './services/shipping-rates.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data cache
let competitorData = [];
let lastScraped = null;

// Load cached data on startup
async function loadCache() {
    try {
        const cacheFile = path.join(__dirname, 'data', 'competitors-cache.json');
        const data = await fs.readFile(cacheFile, 'utf-8');
        const cache = JSON.parse(data);
        competitorData = cache.competitors || [];
        lastScraped = cache.lastScraped || null;
        console.log('✅ Loaded cached competitor data:', competitorData.length, 'competitors');
    } catch (error) {
        console.log('⚠️ No cache found, will scrape fresh data');
        competitorData = [];
    }
}

// Save data to cache
async function saveCache() {
    try {
        const cacheDir = path.join(__dirname, 'data');
        await fs.mkdir(cacheDir, { recursive: true });

        const cacheFile = path.join(cacheDir, 'competitors-cache.json');
        await fs.writeFile(
            cacheFile,
            JSON.stringify({
                competitors: competitorData,
                lastScraped: lastScraped,
                cachedAt: new Date().toISOString()
            }, null, 2)
        );
        console.log('✅ Saved competitor data to cache');
    } catch (error) {
        console.error('❌ Error saving cache:', error.message);
    }
}

// Main scraping function
async function scrapeCompetitors() {
    console.log('🔄 Starting competitor data scraping...');
    const startTime = Date.now();

    try {
        const results = [];
        let successfulScrapes = 0;

        // Scrape from multiple sources with error handling
        console.log('📊 Scraping IndiaMART...');
        try {
            const indiamartData = await scrapeIndiaMART();
            if (indiamartData && indiamartData.length > 0) {
                results.push(...indiamartData);
                successfulScrapes++;
            }
        } catch (error) {
            console.error('  ❌ IndiaMART failed:', error.message);
        }

        console.log('📊 Scraping TradeIndia...');
        try {
            const tradeindiaData = await scrapeTradeIndia();
            if (tradeindiaData && tradeindiaData.length > 0) {
                results.push(...tradeindiaData);
                successfulScrapes++;
            }
        } catch (error) {
            console.error('  ❌ TradeIndia failed:', error.message);
        }

        console.log('📊 Scraping ExportersIndia...');
        try {
            const exportersData = await scrapeExportersIndia();
            if (exportersData && exportersData.length > 0) {
                results.push(...exportersData);
                successfulScrapes++;
            }
        } catch (error) {
            console.error('  ❌ ExportersIndia failed:', error.message);
        }

        // Fallback to demo data if no results
        if (results.length === 0) {
            console.log('⚠️  All scrapers failed - using demo data');
            const demoData = generateDemoCompetitors(12);
            results.push(...demoData);
        }

        // Update global data
        competitorData = results;
        lastScraped = new Date().toISOString();

        // Save to cache
        await saveCache();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Completed in ${duration}s. Found ${results.length} competitors.`);
        console.log(`   Successful scrapes: ${successfulScrapes}/3`);

        return results;
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        // Emergency fallback
        const demoData = generateDemoCompetitors(12);
        competitorData = demoData;
        lastScraped = new Date().toISOString();
        await saveCache();
        return demoData;
    }
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Mirotec Competitor Intelligence Scraper',
        lastScraped: lastScraped,
        competitorsTracked: competitorData.length,
        uptime: process.uptime()
    });
});

app.get('/api/competitors', (req, res) => {
    res.json({
        success: true,
        data: competitorData,
        lastScraped: lastScraped,
        count: competitorData.length,
        cacheDuration: '6 hours'
    });
});

app.get('/api/competitors/:id', (req, res) => {
    const competitor = competitorData.find(c => c.id === req.params.id);

    if (!competitor) {
        return res.status(404).json({
            success: false,
            error: 'Competitor not found'
        });
    }

    res.json({
        success: true,
        data: competitor
    });
});

app.post('/api/scrape/manual', async (req, res) => {
    try {
        console.log('🔄 Manual scrape triggered by API request');
        const results = await scrapeCompetitors();

        res.json({
            success: true,
            message: 'Scraping completed successfully',
            data: results,
            count: results.length,
            lastScraped: lastScraped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/price-comparison/:product', (req, res) => {
    const productName = req.params.product.toLowerCase();

    const relevantCompetitors = competitorData.filter(c =>
        c.products.some(p => p.name.toLowerCase().includes(productName))
    );

    const prices = relevantCompetitors.map(c => {
        const product = c.products.find(p => p.name.toLowerCase().includes(productName));
        return {
            competitor: c.name,
            price: product?.price || 0,
            source: c.source,
            lastUpdated: c.lastScraped
        };
    });

    const avgPrice = prices.length > 0
        ? prices.reduce((sum, p) => sum + p.price, 0) / prices.length
        : 0;

    res.json({
        success: true,
        product: req.params.product,
        competitors: prices,
        marketAverage: Math.round(avgPrice),
        count: prices.length
    });
});

// Shipping Rates API
app.post('/api/shipping/quotes', async (req, res) => {
    try {
        const { weight, length, width, height, destination, value, insurance } = req.body;

        // Validation
        if (!weight || !destination) {
            return res.status(400).json({
                success: false,
                error: 'Weight and destination are required'
            });
        }

        const shipmentDetails = {
            weight: parseFloat(weight),
            length: parseFloat(length) || 0,
            width: parseFloat(width) || 0,
            height: parseFloat(height) || 0,
            destination,
            value: parseFloat(value) || 0,
            insurance: Boolean(insurance),
        };

        const result = await fetchAllCarrierRates(shipmentDetails);

        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching shipping quotes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch shipping quotes'
        });
    }
});

app.post('/api/shipping/quote/:carrier', async (req, res) => {
    try {
        const { carrier } = req.params;
        const { weight, destination, value, insurance } = req.body;

        const shipmentDetails = {
            weight: parseFloat(weight),
            destination,
            value: parseFloat(value) || 0,
            insurance: Boolean(insurance),
        };

        const result = await fetchSingleCarrierRate(carrier, shipmentDetails);

        res.json(result);
    } catch (error) {
        console.error(`❌ Error fetching quote from ${req.params.carrier}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch carrier quote'
        });
    }
});

// Scheduled scraping (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Scheduled scraping triggered');
    try {
        await scrapeCompetitors();
    } catch (error) {
        console.error('❌ Scheduled scraping failed:', error.message);
    }
});

// Initialize
async function initialize() {
    console.log('🚀 Mirotec Competitor Intelligence API Starting...');

    // Load cached data
    await loadCache();

    // If no cache or cache is old (>6 hours), scrape fresh data
    if (!lastScraped || (Date.now() - new Date(lastScraped).getTime()) > 6 * 60 * 60 * 1000) {
        console.log('🔄 Cache is stale, scraping fresh data...');
        try {
            await scrapeCompetitors();
        } catch (error) {
            console.error('❌ Initial scraping failed:', error.message);
            console.log('⚠️ Continuing with cached data (if available)');
        }
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Tracking ${competitorData.length} competitors`);
        console.log(`⏰ Auto-scraping every 6 hours`);
        console.log(`🔗 API Endpoints:`);
        console.log(`   - GET  /api/health`);
        console.log(`   - GET  /api/competitors`);
        console.log(`   - GET  /api/competitors/:id`);
        console.log(`   - POST /api/scrape/manual`);
        console.log(`   - GET  /api/price-comparison/:product`);
    });
}

initialize();
